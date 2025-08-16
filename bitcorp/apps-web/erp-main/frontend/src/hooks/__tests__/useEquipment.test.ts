import { EquipmentStatus, EquipmentType, FuelType } from '@/types/equipment';

describe('Equipment SWR Hooks', () => {
  describe('Hook exports', () => {
    it('should import equipment hooks module', async () => {
      const hooks = await import('../useEquipment');

      expect(typeof hooks.useEquipmentList).toBe('function');
      expect(typeof hooks.useEquipment).toBe('function');
      expect(typeof hooks.useEquipmentTypes).toBe('function');
      expect(typeof hooks.useEquipmentStatuses).toBe('function');
      expect(typeof hooks.useFuelTypes).toBe('function');
      expect(typeof hooks.useEquipmentUtilization).toBe('function');
      expect(typeof hooks.useCreateEquipment).toBe('function');
      expect(typeof hooks.useUpdateEquipment).toBe('function');
      expect(typeof hooks.useDeleteEquipment).toBe('function');
      expect(typeof hooks.useUpdateEquipmentStatus).toBe('function');
      expect(typeof hooks.useEquipmentSearch).toBe('function');
      expect(typeof hooks.useEquipmentByStatus).toBe('function');
      expect(typeof hooks.useAvailableEquipment).toBe('function');
      expect(typeof hooks.useEquipmentStats).toBe('function');
    });
  });

  describe('Type validation', () => {
    it('should validate equipment types', () => {
      const validTypes = [
        EquipmentType.EXCAVATOR,
        EquipmentType.BULLDOZER,
        EquipmentType.LOADER,
      ];
      expect(validTypes.length).toBeGreaterThan(0);
      validTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(Object.values(EquipmentType)).toContain(type);
      });
    });

    it('should validate equipment statuses', () => {
      const validStatuses = [
        EquipmentStatus.AVAILABLE,
        EquipmentStatus.IN_USE,
        EquipmentStatus.MAINTENANCE,
      ];
      expect(validStatuses.length).toBeGreaterThan(0);
      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string');
        expect(Object.values(EquipmentStatus)).toContain(status);
      });
    });

    it('should validate fuel types', () => {
      const validFuelTypes = [
        FuelType.DIESEL,
        FuelType.GASOLINE,
        FuelType.ELECTRIC,
      ];
      expect(validFuelTypes.length).toBeGreaterThan(0);
      validFuelTypes.forEach((fuel) => {
        expect(typeof fuel).toBe('string');
        expect(Object.values(FuelType)).toContain(fuel);
      });
    });
  });

  describe('Module structure', () => {
    it('should have proper module exports', async () => {
      const hooks = await import('../useEquipment');
      const exportedKeys = Object.keys(hooks);

      expect(exportedKeys).toContain('useEquipmentList');
      expect(exportedKeys).toContain('useEquipment');
      expect(exportedKeys).toContain('useCreateEquipment');
      expect(exportedKeys).toContain('useUpdateEquipment');
      expect(exportedKeys).toContain('useDeleteEquipment');
    });
  });
});
