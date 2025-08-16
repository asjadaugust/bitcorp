import { useEquipmentList } from '../useEquipment';

// Simple test without JSX to verify basic setup
describe('Equipment SWR Hooks - Simple', () => {
  test('useEquipmentList hook can be imported', () => {
    expect(typeof useEquipmentList).toBe('function');
  });
});
