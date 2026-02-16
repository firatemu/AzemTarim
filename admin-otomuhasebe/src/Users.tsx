import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  useMediaQuery,
  Stack,
  Grid,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  ArrowUpDown,
  Search,
  Filter,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import StatusChip from '@/components/ui/StatusChip';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useUsers,
  useUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useApproveUserSubscription,
  useAssignTenantId,
  User,
} from '@/hooks/useUsers';
import { formatDateTime, formatDateOnly } from '@/lib/dateUtils';
import { toast } from 'sonner';

export default function Users() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: usersData, isLoading } = useUsers({
    search,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  // Safe array check
  const users: User[] = useMemo(() => {
    if (Array.isArray(usersData)) {
      return usersData;
    }
    if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
      return usersData.data;
    }
    return [];
  }, [usersData]);

  const { data: userDetail } = useUser(selectedUser?.id || '');

  const deleteUser = useDeleteUser();
  const suspendUser = useSuspendUser();
  const updateUser = useUpdateUser();
  const approveSubscription = useApproveUserSubscription();
  const assignTenantId = useAssignTenantId();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [assignTenantDialogOpen, setAssignTenantDialogOpen] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((u) => {
        if (statusFilter === 'ACTIVE') return u.isActive === true;
        if (statusFilter === 'SUSPENDED') return u.isActive === false;
        return true;
      });
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, statusFilter, roleFilter]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
    handleMenuClose();
  };

  const handleEditClick = () => {
    if (menuUser) {
      setSelectedUser(menuUser);
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleSuspendClick = () => {
    setSuspendDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    const userToDelete = menuUser || selectedUser;
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success('Kullanıcı silindi');
      setDeleteDialogOpen(false);
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const handleSuspend = async () => {
    const userToSuspend = menuUser || selectedUser;
    if (!userToSuspend) return;

    try {
      await suspendUser.mutateAsync(userToSuspend.id);
      toast.success(`Kullanıcı ${userToSuspend.isActive ? 'askıya alındı' : 'aktif hale getirildi'}`);
      setSuspendDialogOpen(false);
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const handleApproveSubscription = async () => {
    const userToApprove = menuUser || selectedUser;
    if (!userToApprove) return;

    try {
      await approveSubscription.mutateAsync(userToApprove.id);
      toast.success('Abonelik onaylandı ve Tenant ID atandı!');
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Abonelik onaylanırken hata oluştu');
    }
  };

  // Summary Cards
  const summaryCards = useMemo(() => {
    const safeUsers = Array.isArray(filteredUsers) ? filteredUsers : [];

    return [
      {
        title: 'Toplam Kullanıcı',
        value: safeUsers.length,
        color: theme.palette.primary.main,
        bgColor: theme.palette.primary.light,
      },
      {
        title: 'Aktif Kullanıcı',
        value: safeUsers.filter((u: User) => u?.isActive === true).length,
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light,
      },
      {
        title: 'Pasif Kullanıcı',
        value: safeUsers.filter((u: User) => u?.isActive === false).length,
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light,
      },
      {
        title: 'Admin',
        value: safeUsers.filter((u: User) => u?.role === 'SUPER_ADMIN' || u?.role === 'TENANT_ADMIN').length,
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light,
      },
      {
        title: 'Toplam Harcama',
        value: `₺${safeUsers
          .reduce((sum: number, u: User) => sum + (u?.totalSpent || 0), 0)
          .toLocaleString('tr-TR')}`,
        color: theme.palette.info.main,
        bgColor: theme.palette.info.light,
      },
    ];
  }, [filteredUsers, theme]);

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: 'fullName',
      header: 'Kullanıcı',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium" color="text.primary">
              {user?.fullName || user?.username || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original?.role;
        const roleLabels: Record<string, string> = {
          SUPER_ADMIN: 'Süper Admin',
          TENANT_ADMIN: 'Admin',
          USER: 'Kullanıcı',
          SUPPORT: 'Destek',
        };
        return (
          <Chip
            label={roleLabels[role] || role || 'N/A'}
            size="small"
            color={role === 'SUPER_ADMIN' ? 'error' : role === 'TENANT_ADMIN' ? 'warning' : 'default'}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      accessorKey: 'tenant',
      header: 'Şirket / Tenant ID',
      cell: ({ row }) => {
        const tenant = row.original?.tenant;
        const tenantId = row.original?.tenantId || tenant?.id;
        return (
          <Box>
            <Typography variant="body2" color="text.primary">
              {tenant?.name || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              color={tenantId ? "primary.main" : "text.secondary"}
              fontFamily="monospace"
              fontWeight={tenantId ? "bold" : "normal"}
              sx={{ display: 'block', mt: 0.5 }}
            >
              {tenantId ? `Tenant ID: ${tenantId}` : 'Tenant ID: Yok'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Durum',
      cell: ({ row }) => (
        <StatusChip status={row.original?.isActive ? 'ACTIVE' : 'SUSPENDED'} />
      ),
    },
    {
      accessorKey: 'registeredAt',
      header: 'Kayıt Tarihi',
      cell: ({ row }) => {
        const date = row.original?.registeredAt || row.original?.createdAt;
        return <Typography variant="body2">{date ? formatDateOnly(date) : '-'}</Typography>;
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Son Giriş',
      cell: ({ row }) => {
        const lastLogin = row.original?.lastLoginAt;
        return <Typography variant="body2">{lastLogin ? formatDateOnly(lastLogin) : '-'}</Typography>;
      },
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, row.original)}
        >
          <MoreVertical size={16} />
        </IconButton>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      pageIndex: 0,
    }));
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: theme.palette.primary.main,
            }}
          >
            Kullanıcılar
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              fontWeight: 600,
              px: 3,
            }}
          >
            Export Excel
          </Button>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="500" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: card.color }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="İsim, email veya kullanıcı adı ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
              sx={{ flex: 1 }}
            />
            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="SUSPENDED">Pasif</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rol"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="SUPER_ADMIN">Süper Admin</MenuItem>
                  <MenuItem value="TENANT_ADMIN">Admin</MenuItem>
                  <MenuItem value="USER">Kullanıcı</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* Content: Table or Cards */}
        {isLoading ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography>Yükleniyor...</Typography>
          </Paper>
        ) : isMobile ? (
          // Mobile Card View
          <Stack spacing={2}>
            {table.getRowModel().rows.map((row) => (
              <Card
                key={row.id}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                }}
                onClick={() => handleViewDetails(row.original)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {row.original.fullName || row.original.username || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {row.original.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.original)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Rol:</Typography>
                      <Chip
                        label={row.original.role}
                        size="small"
                        variant="outlined"
                        color={row.original.role === 'SUPER_ADMIN' ? 'error' : row.original.role === 'TENANT_ADMIN' ? 'warning' : 'default'}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Durum:</Typography>
                      <StatusChip status={row.original.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                    </Stack>
                    {row.original.tenant && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Şirket:</Typography>
                        <Typography variant="body2" fontWeight="medium">{row.original.tenant.name}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <Typography textAlign="center" color="text.secondary" py={4}>Veri bulunamadı</Typography>
            )}
            {table.getRowModel().rows.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={pagination.pageSize}
                page={pagination.pageIndex}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Satır:"
                sx={{
                  '.MuiTablePagination-selectLabel': { mb: 0 },
                  '.MuiTablePagination-displayedRows': { mb: 0 },
                }}
              />
            )}
          </Stack>
        ) : (
          // Desktop Table View
          <Paper
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} sx={{ bgcolor: theme.palette.background.default }}>
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          align="left"
                          padding="normal"
                          sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}>
                            <Box component="span">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Box>
                            {header.column.getCanSort() && (
                              <ArrowUpDown size={14} style={{ opacity: 0.5 }} />
                            )}
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Veri bulunamadı</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        hover
                        key={row.id}
                        onClick={() => handleViewDetails(row.original)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={pagination.pageSize}
              page={pagination.pageIndex}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </Paper>
        )}

        {/* Modal Declarations (same structure as before, styled with MUI keys) */}

        {/* Detail Modal */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          {selectedUser && userDetail && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Kullanıcı Detayları
                </Typography>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Ad Soyad
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.fullName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Kullanıcı Adı
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.username || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rol
                    </Typography>
                    <Chip
                      label={userDetail?.role === 'SUPER_ADMIN' ? 'Süper Admin' : userDetail?.role === 'TENANT_ADMIN' ? 'Admin' : 'Kullanıcı'}
                      size="small"
                      color={userDetail?.role === 'SUPER_ADMIN' ? 'error' : userDetail?.role === 'TENANT_ADMIN' ? 'warning' : 'default'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Durum
                    </Typography>
                    <StatusChip status={userDetail?.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                  </Grid>

                  <Grid size={12}>
                    <Divider />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tenant ID
                    </Typography>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: userDetail?.tenantId ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${userDetail?.tenantId ? theme.palette.primary.main : theme.palette.error.main}`
                    }}>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        fontFamily="monospace"
                        color={userDetail?.tenantId ? 'primary.main' : 'error.main'}
                      >
                        {userDetail?.tenantId || 'Tenant ID Bulunamadı'}
                      </Typography>
                    </Box>
                  </Grid>

                  {userDetail?.tenant && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Şirket Adı</Typography>
                        <Typography variant="body1">{userDetail.tenant.name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Domain</Typography>
                        <Typography variant="body1" fontFamily="monospace">{userDetail.tenant.domain}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                {!(userDetail?.tenantId || userDetail?.tenant?.id) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setApproveDialogOpen(true);
                    }}
                    disabled={approveSubscription.isPending}
                  >
                    {approveSubscription.isPending ? 'Onaylanıyor...' : 'Aboneliği Onayla'}
                  </Button>
                )}
                <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuUser && handleViewDetails(menuUser)}>
            <Eye size={16} style={{ marginRight: 8 }} />
            Detayları Gör
          </MenuItem>
          <MenuItem onClick={handleEditClick}>
            <Edit size={16} style={{ marginRight: 8 }} />
            Düzenle
          </MenuItem>
          <MenuItem onClick={handleSuspendClick}>
            {menuUser?.isActive ? (
              <>
                <UserX size={16} style={{ marginRight: 8 }} />
                Askıya Al
              </>
            ) : (
              <>
                <UserCheck size={16} style={{ marginRight: 8 }} />
                Aktif Et
              </>
            )}
          </MenuItem>
          {!(menuUser?.tenantId || menuUser?.tenant?.id) && (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setSelectedUser(menuUser);
                setApproveDialogOpen(true);
              }}
              sx={{ color: 'primary.main' }}
            >
              <UserCheck size={16} style={{ marginRight: 8 }} />
              Aboneliği Onayla (Tenant ID Ata)
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Trash2 size={16} style={{ marginRight: 8 }} />
            Sil
          </MenuItem>
        </Menu>

        {/* Dialogs */}
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Kullanıcı Silme"
          description={`${(menuUser || selectedUser)?.fullName || 'Bu'} kullanıcısını silmek istediğinize emin misiniz?`}
          confirmText="Sil"
          cancelText="Vazgeç"
          severity="error"
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setMenuUser(null);
          }}
        />

        <ConfirmDialog
          open={suspendDialogOpen}
          title={(menuUser || selectedUser)?.isActive ? 'Kullanıcı Askıya Alma' : 'Kullanıcı Aktif Etme'}
          description={`${(menuUser || selectedUser)?.fullName || 'Bu'} kullanıcısını ${(menuUser || selectedUser)?.isActive ? 'askıya almak' : 'aktif hale getirmek'} istediğinize emin misiniz?`}
          confirmText={(menuUser || selectedUser)?.isActive ? 'Askıya Al' : 'Aktif Et'}
          cancelText="Vazgeç"
          severity="warning"
          onConfirm={handleSuspend}
          onCancel={() => {
            setSuspendDialogOpen(false);
            setMenuUser(null);
          }}
        />

        <ConfirmDialog
          open={approveDialogOpen}
          title="Abonelik Onaylama"
          description="Kullanıcı aboneliğini onaylamak ve Tenant ID atamak istiyor musunuz?"
          confirmText="Onayla"
          cancelText="Vazgeç"
          severity="info"
          onConfirm={handleApproveSubscription}
          onCancel={() => {
            setApproveDialogOpen(false);
            setMenuUser(null);
            setSelectedUser(null);
          }}
        />
      </Box>
    </MainLayout >
  );
}


