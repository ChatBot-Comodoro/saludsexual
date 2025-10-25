import React, { useState, forwardRef } from 'react';
import {
  Group,
  Button,
  Text,
  Popover,
  Stack,
  ActionIcon,
  Paper,
  Badge,
  Box,
  Loader
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconCalendar, 
  IconX, 
  IconFilter,
} from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import 'dayjs/locale/es';

const DateRangeFilter = forwardRef(({ 
  startDate, 
  endDate, 
  onDateChange, 
  onClear,
  disabled = false
}, ref) => {
  const [opened, setOpened] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);


 

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateChange(tempStartDate, tempEndDate);
      setOpened(false);
    }
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onClear();
    setOpened(false);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Seleccionar fechas';
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    
    return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
  };

  const isActive = startDate && endDate;

  return (
    <Popover 
      width={400} 
      position="bottom-start" 
      withArrow 
      shadow="md"
      opened={opened}
      onChange={setOpened}
      closeOnClickOutside={true}
      closeOnEscape={true}
      trapFocus={false}
      returnFocus={true}
    >
      <Popover.Target>
        <Button
          ref={ref}
          variant={isActive ? 'filled' : 'light'}
          color={isActive ? 'blue' : 'gray'}
          leftSection={disabled ? <Loader size="xs" /> : <IconCalendar size={16} />}
          rightSection={
            !disabled && isActive && (
              <ActionIcon
                size="xs"
                color="white"
                variant="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <IconX size={12} />
              </ActionIcon>
            )
          }
          onClick={() => {
            if (!disabled) {
              // Sincronizar fechas temporales con las actuales al abrir
              if (!opened) {
                setTempStartDate(startDate);
                setTempEndDate(endDate);
              }
              setOpened((o) => !o);
            }
          }}
          disabled={disabled}
          styles={{
            section: {
              marginLeft: isActive ? 8 : 0,
              marginRight: isActive ? 0 : 8
            }
          }}
        >
          {disabled ? 'Cargando...' : formatDateRange()}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Paper p="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                <IconFilter size={16} style={{ marginRight: 8 }} />
                Filtrar por fechas
              </Text>
              {isActive && (
                <Badge variant="light" color="blue" size="xs">
                  Filtro activo
                </Badge>
              )}
            </Group>

            {/* Rangos predefinidos */}
            <Box>
              <Text size="xs" mb="xs" c="dimmed">Rangos rápidos:</Text>
              <Group gap="xs">
                <Button
                  variant="light"
                  size="xs"
                  disabled={disabled}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    setTempStartDate(start);
                    setTempEndDate(end);
                  }}
                >
                  Últimos 7 días
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  disabled={disabled}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    setTempStartDate(start);
                    setTempEndDate(end);
                  }}
                >
                  Últimos 30 días
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  disabled={disabled}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 90);
                    setTempStartDate(start);
                    setTempEndDate(end);
                  }}
                >
                  Últimos 90 días
                </Button>
              </Group>
            </Box>
 
            {/* Selectores de fecha personalizados */}
            <Stack gap="sm">
              <Text size="xs" c="dimmed">Rango personalizado:</Text>
              
              <DatePickerInput
                label="Fecha de inicio"
                placeholder="Seleccionar fecha de inicio"
                value={tempStartDate}
                onChange={(date) => {
                  setTempStartDate(date);
                  // No cerrar el popover automáticamente
                }}
                maxDate={tempEndDate || new Date()}
                size="sm"
                leftSection={<IconCalendar size={16} />}
                clearable
                disabled={disabled}
                dropdownType="popover"
                popoverProps={{ withinPortal: false }}
              />
              
              <DatePickerInput
                label="Fecha de fin"
                placeholder="Seleccionar fecha de fin"
                value={tempEndDate}
                onChange={(date) => {
                  setTempEndDate(date);
                  // No cerrar el popover automáticamente
                }}
                minDate={tempStartDate}
                maxDate={new Date()}
                size="sm"
                leftSection={<IconCalendar size={16} />}
                clearable
                disabled={disabled}
                dropdownType="popover"
                popoverProps={{ withinPortal: false }}
              />
            </Stack>

            {/* Botones de acción */}
            <Group justify="space-between" mt="md">
              <Button
                variant="light"
                color="gray"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
              >
                Limpiar
              </Button>
              
              <Button
                size="sm"
                onClick={handleApply}
                disabled={disabled || !tempStartDate || !tempEndDate}
                loading={disabled}
              >
                Aplicar filtro
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  );
});

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;