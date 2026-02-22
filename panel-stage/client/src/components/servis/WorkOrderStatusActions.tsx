'use client';

import React from 'react';
import { Button, Stack, Box, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, Inventory2, DirectionsCar } from '@mui/icons-material';
import type { PartWorkflowStatus, VehicleWorkflowStatus, WorkOrderStatus } from '@/types/servis';

const PART_WORKFLOW_FLOW: PartWorkflowStatus[] = [
  'NOT_STARTED',
  'PARTS_SUPPLIED_DIRECT',
  'PARTS_PENDING',
  'PARTIALLY_SUPPLIED',
  'ALL_PARTS_SUPPLIED',
];

const PART_WORKFLOW_LABELS: Record<PartWorkflowStatus, string> = {
  NOT_STARTED: 'Henüz başlamadı',
  PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
  PARTS_PENDING: 'Parça bekleniyor',
  PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
  ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
};

const VEHICLE_WORKFLOW_FLOW: VehicleWorkflowStatus[] = [
  'WAITING',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
];

const VEHICLE_WORKFLOW_LABELS: Record<VehicleWorkflowStatus, string> = {
  WAITING: 'Bekleme',
  IN_PROGRESS: 'Yapım aşamasında',
  READY: 'Hazır',
  DELIVERED: 'Teslim edildi',
};

const VEHICLE_WORKFLOW_TRANSITIONS: Record<
  VehicleWorkflowStatus,
  { status: VehicleWorkflowStatus; label: string; hideForTechnician?: boolean }[]
> = {
  WAITING: [
    { status: 'IN_PROGRESS', label: 'Yapım Aşamasına Geç' },
  ],
  IN_PROGRESS: [
    { status: 'READY', label: 'Hazır' },
  ],
  READY: [
    { status: 'DELIVERED', label: 'İş emrini kapat', hideForTechnician: true },
  ],
  DELIVERED: [],
};

interface WorkOrderStatusActionsProps {
  partWorkflowStatus: PartWorkflowStatus;
  vehicleWorkflowStatus: VehicleWorkflowStatus;
  status: WorkOrderStatus;
  onVehicleWorkflowChange: (vehicleWorkflowStatus: VehicleWorkflowStatus) => void;
  onCloseWithoutInvoice?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  actualCompletionDate?: string | null;
  isTechnician?: boolean;
}

export default function WorkOrderStatusActions({
  partWorkflowStatus,
  vehicleWorkflowStatus,
  status,
  onVehicleWorkflowChange,
  onCloseWithoutInvoice,
  onCancel,
  loading = false,
  actualCompletionDate,
  isTechnician = false,
}: WorkOrderStatusActionsProps) {
  const isCancelled = status === 'CANCELLED';

  const partFlowIndex = PART_WORKFLOW_FLOW.indexOf(partWorkflowStatus);
  const vehicleFlowIndex = VEHICLE_WORKFLOW_FLOW.indexOf(vehicleWorkflowStatus);

  const rawTransitions = VEHICLE_WORKFLOW_TRANSITIONS[vehicleWorkflowStatus] ?? [];
  const transitions = isTechnician ? rawTransitions.filter((t) => !t.hideForTechnician) : rawTransitions;

  const handleTransition = (t: { status: VehicleWorkflowStatus; label: string }) => {
    if (t.status === 'DELIVERED' && onCloseWithoutInvoice) {
      onCloseWithoutInvoice();
    } else {
      onVehicleWorkflowChange(t.status);
    }
  };

  return (
    <Box>
      {!isCancelled && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Inventory2 fontSize="small" /> Parça İş Akışı
            </Typography>
            <Stepper
              activeStep={partFlowIndex >= 0 ? partFlowIndex : 0}
              alternativeLabel
              sx={{ '& .MuiStepConnector-line': { minHeight: 2 } }}
            >
              {PART_WORKFLOW_FLOW.map((s, idx) => {
                const isCompleted = partFlowIndex > idx;
                const isCurrent = partFlowIndex === idx;
                return (
                  <Step
                    key={s}
                    completed={isCompleted}
                    sx={
                      isCurrent
                        ? {
                            '& .MuiStepLabel-label': { fontWeight: 600 },
                            '& .MuiStepLabel-root': { borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 },
                          }
                        : undefined
                    }
                  >
                    <StepLabel
                      StepIconComponent={() =>
                        isCompleted ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : isCurrent ? (
                          <RadioButtonUnchecked color="primary" fontSize="small" />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: 'action.disabled' }} fontSize="small" />
                        )
                      }
                    >
                      <Typography variant="caption" fontWeight={isCurrent ? 600 : 400}>
                        {PART_WORKFLOW_LABELS[s]}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DirectionsCar fontSize="small" /> Araç İş Akışı
            </Typography>
            <Stepper
              activeStep={vehicleFlowIndex >= 0 ? vehicleFlowIndex : 0}
              alternativeLabel
              sx={{ mb: transitions.length > 0 ? 2 : 0, '& .MuiStepConnector-line': { minHeight: 2 } }}
            >
              {VEHICLE_WORKFLOW_FLOW.map((s, idx) => {
                const isCompleted = vehicleFlowIndex > idx;
                const isCurrent = vehicleFlowIndex === idx;
                return (
                  <Step
                    key={s}
                    completed={isCompleted}
                    sx={
                      isCurrent
                        ? {
                            '& .MuiStepLabel-label': { fontWeight: 600 },
                            '& .MuiStepLabel-root': { borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 },
                          }
                        : undefined
                    }
                  >
                    <StepLabel
                      StepIconComponent={() =>
                        isCompleted ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : isCurrent ? (
                          <RadioButtonUnchecked color="primary" fontSize="small" />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: 'action.disabled' }} fontSize="small" />
                        )
                      }
                    >
                      <Typography variant="caption" fontWeight={isCurrent ? 600 : 400}>
                        {VEHICLE_WORKFLOW_LABELS[s]}
                      </Typography>
                      {isCurrent && actualCompletionDate && (s === 'DELIVERED' || s === 'READY') && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(actualCompletionDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            {(transitions.length > 0 || (onCancel && vehicleWorkflowStatus !== 'DELIVERED')) && (
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {transitions.map((t) => (
                  <Button
                    key={t.status}
                    variant={t.status === 'DELIVERED' ? 'outlined' : 'contained'}
                    color="primary"
                    size="small"
                    onClick={() => handleTransition(t)}
                    disabled={loading}
                  >
                    {t.label}
                  </Button>
                ))}
                {onCancel && vehicleWorkflowStatus !== 'DELIVERED' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    İptal Et
                  </Button>
                )}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}
      {isCancelled && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          İş emri iptal edildi
        </Typography>
      )}
    </Box>
  );
}
