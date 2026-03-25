'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Switch, FormControlLabel, Button, Divider, Grid } from '@mui/material';
import BankAccountSelect from '@/components/common/BankAccountSelect';
import CashboxSelect from '@/components/common/CashboxSelect';
import SaveIcon from '@mui/icons-material/Save';

export default function SettingsClient() {
    const [prefix, setPrefix] = useState('B-2025-');
    const [startNo, setStartNo] = useState(1);
    const [autoNumber, setAutoNumber] = useState(true);

    const [autoUnpaid, setAutoUnpaid] = useState(true);
    const [sendReminder, setSendReminder] = useState(false);
    const [reminderDays, setReminderDays] = useState(3);

    const [defaultBank, setDefaultBank] = useState<string | null>(null);
    const [defaultCashbox, setDefaultCashbox] = useState<string | null>(null);

    const handleSave = (section: string) => {
        // In a real app this would POST to a /api/settings endpoint
        alert(`${section} ayarları kaydedildi.`);
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Bordro Numaralandırma</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Yeni bordrolar oluşturulurken kullanılacak otomatik numara şablonu.
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label="Önek (Prefix)"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label="Başlangıç No"
                                type="number"
                                value={startNo}
                                onChange={(e) => setStartNo(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Switch checked={autoNumber} onChange={(e) => setAutoNumber(e.target.checked)} />}
                                label="Otomatik Sırala"
                            />
                        </Grid>
                    </Grid>
                    <Box mt={2} textAlign="right">
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Numaralandırma')}>Kaydet</Button>
                    </Box>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Otomatik Durum Geçişleri</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Sistemdeki evrakların vade takibi ve bildirim ayarları.
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Box>
                            <FormControlLabel
                                control={<Switch checked={autoUnpaid} onChange={(e) => setAutoUnpaid(e.target.checked)} />}
                                label="Vadesi geçince otomatik UNPAID (Ödenmedi) yap"
                            />
                            <Typography variant="caption" color="text.secondary" display="block" ml={4}>
                                Her gece 01:00'de çalışan CRON görevi (Sadece Borç evrakları için geçerlidir).
                            </Typography>
                        </Box>
                        <Divider />
                        <Box display="flex" alignItems="center" gap={3}>
                            <FormControlLabel
                                control={<Switch checked={sendReminder} onChange={(e) => setSendReminder(e.target.checked)} />}
                                label="Hatırlatma Gönder"
                            />
                            <TextField
                                select
                                SelectProps={{ native: true }}
                                label="Kaç Gün Önce?"
                                size="small"
                                value={reminderDays}
                                onChange={(e) => setReminderDays(Number(e.target.value))}
                                disabled={!sendReminder}
                            >
                                <option value={1}>1 Gün</option>
                                <option value={3}>3 Gün</option>
                                <option value={7}>7 Gün</option>
                            </TextField>
                        </Box>
                    </Box>
                    <Box mt={2} textAlign="right">
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Durum/Bildirim')}>Kaydet</Button>
                    </Box>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Varsayılan Değerler</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Sık kullanılan tahsilat noktalarını belirleyin.
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <BankAccountSelect
                                value={defaultBank}
                                onChange={setDefaultBank}
                                helperText="Banka tahsilatlarında varsayılan olarak seçili gelir"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CashboxSelect
                                value={defaultCashbox}
                                onChange={setDefaultCashbox}
                                helperText="Nakit kasa tahsilatlarında varsayılan olarak seçili gelir"
                            />
                        </Grid>
                    </Grid>
                    <Box mt={2} textAlign="right">
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Varsayılan Değerler')}>Kaydet</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
