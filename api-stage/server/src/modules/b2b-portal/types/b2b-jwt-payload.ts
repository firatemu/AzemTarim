export type B2bJwtUserType = 'CUSTOMER' | 'SALESPERSON';

export interface B2bJwtPayload {
  sub: string;
  tenantId: string;
  b2bDomainId: string;
  userType: B2bJwtUserType;
  email?: string;
}
