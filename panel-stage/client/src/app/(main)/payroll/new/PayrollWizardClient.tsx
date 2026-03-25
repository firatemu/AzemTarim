'use client';

import React, { useReducer } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Card, CardContent, Typography, Grid, TextField, IconButton, Autocomplete } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { QK } from '@/lib/query-keys';
import { JournalType, CheckBillType, PortfolioType } from '@/types/check-bill';
import { JOURNAL_TYPE_LABEL, JOURNAL_TYPE_DESCRIPTION, TYPE_LABEL } from '@/lib/labels';
import { formatAmount, formatDate } from '@/lib/format';
import { wizardReducer, initialState, WizardDocument } from './wizard-reducer';
import AccountSelect from '@/components/common/AccountSelect';
import BankAccountSelect from '@/components/common/BankAccountSelect';
import { TURKISH_BANKS } from '@/constants/bankalar';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { useChecks } from '@/hooks/use-checks';
import { CheckBillStatus } from '@/types/check-bill';

const STEPS = ['Bordro Türü', 'Genel Bilgiler', 'Evrak Listesi', 'Onay'];

const AVAILABLE_TYPES = [
    JournalType.CUSTOMER_DOCUMENT_ENTRY,
    JournalType.CUSTOMER_DOCUMENT_EXIT,
    JournalType.OWN_DOCUMENT_ENTRY,
    JournalType.BANK_COLLECTION_ENDORSEMENT,
    JournalType.BANK_GUARANTEE_ENDORSEMENT,
    JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT
];

export default function PayrollWizardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const qc = useQueryClient();
    const [state, dispatch] = useReducer(wizardReducer, initialState);

    const isSelectionMode = state.type && [
        JournalType.CUSTOMER_DOCUMENT_EXIT,
        JournalType.BANK_COLLECTION_ENDORSEMENT,
        JournalType.BANK_GUARANTEE_ENDORSEMENT,
        JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT
    ].includes(state.type);

    // Fetch portfolio documents for selection mode
    const { data: portfolioChecks, isLoading: isPortfolioLoading } = useChecks(
        isSelectionMode ? {
            status: CheckBillStatus.IN_PORTFOLIO,
            portfolioType: PortfolioType.CREDIT
        } : undefined
    );

    React.useEffect(() => {
        const typeParam = searchParams.get('type') as JournalType;
        if (typeParam && AVAILABLE_TYPES.includes(typeParam) && !state.type) {
            dispatch({ type: 'SET_JOURNAL_TYPE', payload: typeParam });
        }
    }, [searchParams, state.type]);

    // Fetch next journal number when type is selected or changed
    React.useEffect(() => {
        if (state.type && !state.journalNo) {
            axios.get('/code-templates/next-code/CHECK_BILL_JOURNAL')
                .then(res => {
                    if (res.data?.nextCode) {
                        dispatch({
                            type: 'SET_INFO',
                            payload: { journalNo: res.data.nextCode }
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching next journal number:', err);
                });
        }
    }, [state.type, state.journalNo]);

    const [currentDoc, setCurrentDoc] = React.useState<Partial<WizardDocument>>({
        type: CheckBillType.CHECK,
        dueDate: state.date,
        amount: 0,
        checkNo: '',
        serialNo: '',
        bank: '',
        branch: '',
        accountNo: '',
        notes: ''
    });

    // Fetch next document number when entering step 3 or currentDoc.checkNo is cleared
    React.useEffect(() => {
        if (state.activeStep === 2 && !isSelectionMode && !currentDoc.checkNo) {
            axios.get('/code-templates/preview-code/CHECK_BILL_DOCUMENT')
                .then(res => {
                    if (res.data?.nextCode) {
                        setCurrentDoc(prev => ({ ...prev, checkNo: res.data.nextCode }));
                    }
                })
                .catch(err => {
                    console.error('Error fetching next document number:', err);
                });
        }
    }, [state.activeStep, isSelectionMode, currentDoc.checkNo === '']); // Trigger when checkNo becomes empty string

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await axios.post('/payroll', payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            qc.invalidateQueries({ queryKey: QK.journals() });
            router.push(`/payroll/${data.id}`);
        }
    });

    const handleNext = () => dispatch({ type: 'NEXT_STEP' });
    const handleBack = () => dispatch({ type: 'PREV_STEP' });

    const isStep2Valid = state.date && ((state.type === JournalType.CUSTOMER_DOCUMENT_ENTRY && state.accountId) ||
        (state.type === JournalType.OWN_DOCUMENT_ENTRY && state.accountId) ||
        (state.type === JournalType.BANK_COLLECTION_ENDORSEMENT && state.bankAccountId) ||
        ((state.type === JournalType.CUSTOMER_DOCUMENT_EXIT || state.type === JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT) && state.accountId));

    const handleSubmit = () => {
        createMutation.mutate({
            type: state.type,
            journalNo: state.journalNo,
            date: new Date(state.date).toISOString(),
            accountId: state.accountId,
            bankAccountId: state.bankAccountId,
            cashboxId: state.cashboxId,
            notes: state.notes,
            selectedDocumentIds: isSelectionMode ? state.selectedDocumentIds : [],
            newDocuments: !isSelectionMode ? state.documents.map((doc: any) => ({
                type: doc.type,
                portfolioType: doc.portfolioType,
                amount: Number(doc.amount),
                dueDate: new Date(doc.dueDate).toISOString(),
                checkNo: doc.checkNo || '',
                serialNo: doc.serialNo || '',
                bank: doc.bank,
                branch: doc.branch,
                accountNo: doc.accountNo,
                notes: doc.notes
            })) : []
        });
    };

    const renderStep1 = () => (
        <Grid container spacing={2}>
            {AVAILABLE_TYPES.map(type => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type}>
                    <Card
                        variant="outlined"
                        sx={{
                            cursor: 'pointer',
                            height: '100%',
                            borderColor: state.type === type ? 'primary.main' : 'divider',
                            borderWidth: state.type === type ? 2 : 1,
                            '&:hover': { borderColor: 'primary.light' }
                        }}
                        onClick={() => dispatch({ type: 'SET_JOURNAL_TYPE', payload: type })}
                    >
                        <CardContent>
                            <Typography variant="h6" color={state.type === type ? 'primary' : 'text.primary'}>
                                {JOURNAL_TYPE_LABEL[type]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                {JOURNAL_TYPE_DESCRIPTION[type]}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderStep2 = () => (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    fullWidth
                    label="Tarih"
                    type="date"
                    required
                    value={state.date}
                    onChange={(e) => dispatch({ type: 'SET_INFO', payload: { date: e.target.value } })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    fullWidth
                    label="Bordro No"
                    placeholder="Otomatik üretilir..."
                    value={state.journalNo}
                    onChange={(e) => dispatch({ type: 'SET_INFO', payload: { journalNo: e.target.value } })}
                    helperText="Şablona göre otomatik üretilir, isterseniz elle değiştirebilirsiniz."
                />
            </Grid>

            {(state.type === JournalType.CUSTOMER_DOCUMENT_ENTRY || state.type === JournalType.OWN_DOCUMENT_ENTRY || state.type === JournalType.CUSTOMER_DOCUMENT_EXIT || state.type === JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT) && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <AccountSelect
                        value={state.accountId}
                        onChange={(val) => dispatch({ type: 'SET_INFO', payload: { accountId: val } })}
                        required
                        helperText="İşlemin yapılacağı cari hesabı seçin"
                    />
                </Grid>
            )}

            {(state.type === JournalType.BANK_COLLECTION_ENDORSEMENT || state.type === JournalType.BANK_GUARANTEE_ENDORSEMENT) && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <BankAccountSelect
                        value={state.bankAccountId}
                        onChange={(val) => dispatch({ type: 'SET_INFO', payload: { bankAccountId: val } })}
                        required
                        helperText="Gönderilecek banka hesabını seçin"
                    />
                </Grid>
            )}

            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Bordro Açıklaması (Opsiyonel)"
                    value={state.notes}
                    onChange={(e) => dispatch({ type: 'SET_INFO', payload: { notes: e.target.value } })}
                />
            </Grid>
        </Grid>
    );

    const handleAddDocument = () => {
        if (!currentDoc.amount || currentDoc.amount <= 0) return;
        dispatch({
            type: 'ADD_DOCUMENT',
            payload: {
                id: Math.random().toString(36).substring(7),
                type: currentDoc.type || CheckBillType.CHECK,
                portfolioType: state.type === JournalType.OWN_DOCUMENT_ENTRY ? PortfolioType.DEBIT : PortfolioType.CREDIT,
                amount: Number(currentDoc.amount),
                dueDate: currentDoc.dueDate || state.date,
                checkNo: currentDoc.checkNo,
                serialNo: currentDoc.serialNo,
                bank: currentDoc.bank,
                branch: currentDoc.branch,
                accountNo: currentDoc.accountNo,
                notes: currentDoc.notes
            }
        });
        setCurrentDoc({
            type: currentDoc.type,
            dueDate: currentDoc.dueDate,
            amount: 0,
            checkNo: '',
            serialNo: '',
            bank: '',
            branch: '',
            accountNo: '',
            notes: ''
        });
    };

    const documentColumns: GridColDef[] = [
        { field: 'type', headerName: 'Tip', flex: 1, valueFormatter: (value) => TYPE_LABEL[value as CheckBillType] || value },
        { field: 'dueDate', headerName: 'Vade', flex: 1, valueFormatter: (value) => formatDate(value) },
        { field: 'checkNo', headerName: 'Evrak No', flex: 1 },
        { field: 'amount', headerName: 'Tutar', flex: 1, type: 'number', valueFormatter: (value) => formatAmount(value) },
        { field: 'bank', headerName: 'Banka', flex: 1 },
        {
            field: 'actions',
            headerName: 'Sil',
            width: 60,
            renderCell: (params) => (
                <IconButton size="small" color="error" onClick={() => dispatch({ type: 'REMOVE_DOCUMENT', payload: params.row.id })}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    const pickColumns: GridColDef[] = [
        { field: 'checkNo', headerName: 'Evrak No', flex: 1 },
        { field: 'type', headerName: 'Tip', flex: 0.8, valueFormatter: (value) => TYPE_LABEL[value as CheckBillType] || value },
        { field: 'dueDate', headerName: 'Vade', flex: 1, valueFormatter: (value) => formatDate(value) },
        { field: 'amount', headerName: 'Tutar', flex: 1, type: 'number', valueFormatter: (value) => formatAmount(value) },
        { field: 'bank', headerName: 'Banka', flex: 1.2 },
        { field: 'branch', headerName: 'Şube', flex: 1 },
    ];

    const renderStep3 = () => (
        <Box>
            {isSelectionMode ? (
                <>
                    <Typography variant="h6" mb={2}>Portföyden Evrak Seçimi</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Lütfen işlem yapmak istediğiniz evrakları listeden seçiniz. Sadece portföyünüzde bulunan müşteri evrakları listelenmektedir.
                    </Typography>
                    <Box sx={{ height: 450, width: '100%', mb: 2 }}>
                        <DataGrid
                            rows={portfolioChecks || []}
                            columns={pickColumns}
                            loading={isPortfolioLoading}
                            checkboxSelection
                            disableRowSelectionOnClick
                            onRowSelectionModelChange={(newModel: GridRowSelectionModel) => {
                                dispatch({
                                    type: 'SET_SELECTED_DOCUMENTS',
                                    payload: Array.from(newModel.ids) as string[]
                                });
                            }}
                            rowSelectionModel={{
                                type: 'include',
                                ids: new Set(state.selectedDocumentIds)
                            }}
                        />
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Typography variant="subtitle1" fontWeight="bold">
                            Seçilen Toplam: {formatAmount((portfolioChecks || [])
                                .filter(c => state.selectedDocumentIds.includes(c.id))
                                .reduce((acc, curr) => acc + curr.amount, 0))}
                        </Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h6" mb={2}>Evrak Girişi</Typography>
                    <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
                        {/* ... (Existing Grid and Form) */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Evrak Tipi"
                                    value={currentDoc.type}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, type: e.target.value as CheckBillType })}
                                    SelectProps={{ native: true }}
                                >
                                    <option value={CheckBillType.CHECK}>{TYPE_LABEL[CheckBillType.CHECK]}</option>
                                    <option value={CheckBillType.PROMISSORY}>{TYPE_LABEL[CheckBillType.PROMISSORY]}</option>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Vade Tarihi"
                                    value={currentDoc.dueDate || ''}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, dueDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Evrak No"
                                    value={currentDoc.checkNo || ''}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, checkNo: e.target.value })}
                                    helperText="Şablona göre otomatik üretilir veya el ile girilebilir."
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Tutar"
                                    value={currentDoc.amount || ''}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, amount: Number(e.target.value) })}
                                />
                            </Grid>

                            {currentDoc.type === CheckBillType.CHECK && (
                                <>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Autocomplete
                                            fullWidth
                                            options={TURKISH_BANKS}
                                            value={currentDoc.bank || ''}
                                            onChange={(_, newValue) => setCurrentDoc({ ...currentDoc, bank: newValue || '' })}
                                            onInputChange={(_, newInputValue) => {
                                                if (newInputValue !== currentDoc.bank) {
                                                    setCurrentDoc(prev => ({ ...prev, bank: newInputValue }));
                                                }
                                            }}
                                            freeSolo
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Banka"
                                                    placeholder="Seçin veya yazın..."
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Şube"
                                            value={currentDoc.branch || ''}
                                            onChange={(e) => setCurrentDoc({ ...currentDoc, branch: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Hesap No"
                                            value={currentDoc.accountNo || ''}
                                            onChange={(e) => setCurrentDoc({ ...currentDoc, accountNo: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Seri No"
                                            value={currentDoc.serialNo || ''}
                                            onChange={(e) => setCurrentDoc({ ...currentDoc, serialNo: e.target.value })}
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid size={{ xs: 12, md: 10 }}>
                                <TextField
                                    fullWidth
                                    label="Evrak Açıklaması (Opsiyonel)"
                                    value={currentDoc.notes || ''}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, notes: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleAddDocument}
                                    disabled={!currentDoc.amount || !currentDoc.dueDate || !currentDoc.checkNo}
                                    sx={{ height: 56 }}
                                >
                                    Ekle
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>

                    <Typography variant="h6" mb={2}>Eklenen Evraklar</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <DataGrid
                            rows={state.documents}
                            columns={documentColumns}
                            disableRowSelectionOnClick
                            hideFooter
                        />
                    </Box>
                </>
            )}
        </Box>
    );

    const renderStep4 = () => (
        <Box>
            <Typography variant="h6" gutterBottom>Önizleme ve Onay</Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Typography><strong>Bordro Tipi:</strong> {state.type ? JOURNAL_TYPE_LABEL[state.type] : '-'}</Typography>
                    <Typography><strong>Tarih:</strong> {formatDate(state.date)}</Typography>
                    <Typography><strong>Toplam Evrak:</strong> {isSelectionMode ? state.selectedDocumentIds.length : state.documents.length}</Typography>
                    <Typography><strong>Toplam Tutar:</strong> {isSelectionMode
                        ? formatAmount((portfolioChecks || []).filter(c => state.selectedDocumentIds.includes(c.id)).reduce((acc, curr) => acc + curr.amount, 0))
                        : formatAmount(state.documents.reduce((acc, curr: any) => acc + Number(curr.amount), 0))}
                    </Typography>
                </CardContent>
            </Card>
            <Button
                variant="contained"
                size="large"
                fullWidth
                color="primary"
                onClick={handleSubmit}
                disabled={createMutation.isPending || state.documents.length === 0}
            >
                {createMutation.isPending ? 'Kaydediliyor...' : 'Bordroyu Onayla ve Kaydet'}
            </Button>
        </Box>
    );

    const getStepContent = (step: number) => {
        switch (step) {
            case 0: return renderStep1();
            case 1: return renderStep2();
            case 2: return renderStep3();
            case 3: return renderStep4();
            default: return null;
        }
    };

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
                <Stepper activeStep={state.activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Box minHeight={300}>
                    {getStepContent(state.activeStep)}
                </Box>

                <Box display="flex" justifyContent="space-between" mt={4} pt={2} borderTop={1} borderColor="divider">
                    <Button disabled={state.activeStep === 0} onClick={handleBack}>
                        Geri
                    </Button>
                    {state.activeStep < STEPS.length - 1 && (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={
                                (state.activeStep === 0 && !state.type) ||
                                (state.activeStep === 1 && !isStep2Valid) ||
                                (state.activeStep === 2 && (isSelectionMode ? state.selectedDocumentIds.length === 0 : state.documents.length === 0))
                            }
                        >
                            İleri
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
