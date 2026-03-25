'use client';

import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useAccounts } from '@/hooks/use-selects';
import { Account } from '@/types/check-bill';

interface AccountSelectProps {
    value: string | null;
    onChange: (value: string | null) => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function AccountSelect({ value, onChange, error, helperText, required, disabled }: AccountSelectProps) {
    const [inputValue, setInputValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(inputValue);
        }, 400);
        return () => clearTimeout(handler);
    }, [inputValue]);

    const { data: accounts, isLoading } = useAccounts(debouncedSearch);

    // Find the selected object based on value string
    const selectedObject = accounts?.find(a => a.id === value) || null;

    return (
        <Autocomplete
            options={accounts || []}
            getOptionLabel={(option: Account) => option.code ? `[${option.code}] ${option.title}` : option.title}
            value={selectedObject}
            onChange={(event, newValue) => {
                onChange(newValue ? newValue.id : null);
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            disabled={disabled}
            loading={isLoading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Cari Hesap"
                    required={required}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}
