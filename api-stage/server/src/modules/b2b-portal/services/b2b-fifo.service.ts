import { Injectable } from '@nestjs/common';
import { B2BMovementType, Prisma } from '@prisma/client';

/** FIFO hesaplaması için minimal hareket (DB satırından map edilebilir). */
export interface B2BFifoMovementInput {
  id: string;
  date: Date;
  type: B2BMovementType;
  debit: Prisma.Decimal | number | string;
  credit: Prisma.Decimal | number | string;
}

export interface B2BFifoMovementRow extends B2BFifoMovementInput {
  isPastDue: boolean;
  /** INVOICE (borc) satirlari icin */
  dueDate?: Date;
  /** FIFO tahsilat sonrasi kalan fatura borcu (sadece ilgili fatura satiri) */
  remainingInvoiceDebit?: Prisma.Decimal;
}

export interface B2BFifoResult {
  movements: B2BFifoMovementRow[];
  summary: {
    totalDebit: Prisma.Decimal;
    totalCredit: Prisma.Decimal;
    balance: Prisma.Decimal;
    overdueAmount: Prisma.Decimal;
    oldestOverdueDate: Date | null;
  };
}

@Injectable()
export class B2BFifoService {
  private toDec(v: Prisma.Decimal | number | string): Prisma.Decimal {
    return v instanceof Prisma.Decimal ? v : new Prisma.Decimal(v as string);
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + days);
    return x;
  }

  /** Gun bazinda: a gunu, b gununden once mi (saat normalize) */
  private isDateBefore(a: Date, b: Date): boolean {
    const da = new Date(a);
    da.setHours(0, 0, 0, 0);
    const db = new Date(b);
    db.setHours(0, 0, 0, 0);
    return da.getTime() < db.getTime();
  }

  /**
   * Fatura borclarini (INVOICE, debit>0) FIFO ile odemeler/alislar (credit>0) kapatir.
   * Vade: fatura tarihi + vatDays. Kismi kapali fatura vadesi gecmisse isPastDue.
   */
  calculateFifo(
    movements: B2BFifoMovementInput[],
    vatDays: number,
    asOf: Date = new Date(),
  ): B2BFifoResult {
    const sorted = [...movements].sort((a, b) => {
      const t = a.date.getTime() - b.date.getTime();
      return t !== 0 ? t : a.id.localeCompare(b.id);
    });

    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    type Q = { movementId: string; dueDate: Date; remaining: Prisma.Decimal };
    const queue: Q[] = [];

    for (const m of sorted) {
      const dr = this.toDec(m.debit);
      const cr = this.toDec(m.credit);
      totalDebit = totalDebit.add(dr);
      totalCredit = totalCredit.add(cr);

      if (m.type === B2BMovementType.INVOICE && dr.gt(0)) {
        queue.push({
          movementId: m.id,
          dueDate: this.addDays(m.date, vatDays),
          remaining: dr,
        });
      }

      if (cr.gt(0)) {
        let pay = cr;
        for (const inv of queue) {
          if (pay.lte(0)) break;
          if (inv.remaining.lte(0)) continue;
          const take = inv.remaining.lt(pay) ? inv.remaining : pay;
          inv.remaining = inv.remaining.sub(take);
          pay = pay.sub(take);
        }
      }
    }

    const remainingById = new Map<string, Prisma.Decimal>();
    for (const inv of queue) {
      remainingById.set(inv.movementId, inv.remaining);
    }

    let overdueAmount = new Prisma.Decimal(0);
    let oldestOverdueDate: Date | null = null;

    const rows: B2BFifoMovementRow[] = movements.map((m) => {
      const dr = this.toDec(m.debit);
      const cr = this.toDec(m.credit);
      const base: B2BFifoMovementRow = {
        ...m,
        isPastDue: false,
      };

      if (m.type === B2BMovementType.INVOICE && dr.gt(0)) {
        const dueDate = this.addDays(m.date, vatDays);
        const rem = remainingById.get(m.id) ?? new Prisma.Decimal(0);
        const past =
          rem.gt(0) && this.isDateBefore(dueDate, asOf);
        base.dueDate = dueDate;
        base.remainingInvoiceDebit = rem;
        base.isPastDue = past;
        if (past) {
          overdueAmount = overdueAmount.add(rem);
          if (!oldestOverdueDate || dueDate < oldestOverdueDate) {
            oldestOverdueDate = dueDate;
          }
        }
      }

      return base;
    });

    const balance = totalDebit.sub(totalCredit);

    return {
      movements: rows,
      summary: {
        totalDebit,
        totalCredit,
        balance,
        overdueAmount,
        oldestOverdueDate,
      },
    };
  }
}
