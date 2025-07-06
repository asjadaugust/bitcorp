-- =============================================
-- Script: Bitcorp ERP Dummy Data Insertion
-- Author: AI Assistant
-- Date: 2025-07-06
-- Description: Inserts comprehensive dummy data for Bitcorp ERP system
-- following the database schema structure
-- =============================================

USE [dbBitCorp]
GO

-- Disable foreign key constraints temporarily for data insertion
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
GO

-- =============================================
-- 1. OPERATIONAL UNITS (UNIDADES OPERATIVAS)
-- =============================================
PRINT 'Inserting Operational Units...'

INSERT INTO [dbo].[tbl_G00001_UnidadOperativa] 
([G00001_Id_UnidadOperativa], [G00001_CodigoUnidadOperativa], [G00001_UnidadOperativa], [G00001_Proyecto])
VALUES
('UO00001', 'UO001', 'Unidad Central', 'Proyecto Minero Las Bambas'),
('UO00002', 'UO002', 'Unidad Norte', 'Proyecto Construcción Carretera Norte'),
('UO00003', 'UO003', 'Unidad Sur', 'Proyecto Expansión Puerto Sur'),
('UO00004', 'UO004', 'Unidad Este', 'Proyecto Infraestructura Este'),
('UO00005', 'UO005', 'Unidad Oeste', 'Proyecto Desarrollo Urbano Oeste')
GO

-- =============================================
-- 2. ROLES
-- =============================================
PRINT 'Inserting Roles...'

SET IDENTITY_INSERT [dbo].[tbl_G00004_Rol] ON
INSERT INTO [dbo].[tbl_G00004_Rol] ([G00004_Id_Rol], [G00004_Rol])
VALUES
(1, 'Administrador'),
(2, 'Gerente General'),
(3, 'Jefe de Operaciones'),
(4, 'Supervisor de Equipos'),
(5, 'Operador'),
(6, 'Contador'),
(7, 'Analista de Costos'),
(8, 'Jefe de Logística'),
(9, 'Coordinador SSOMA'),
(10, 'Desarrollador')
SET IDENTITY_INSERT [dbo].[tbl_G00004_Rol] OFF
GO

-- =============================================
-- 3. PERMISSIONS
-- =============================================
PRINT 'Inserting Permissions...'

SET IDENTITY_INSERT [dbo].[tbl_G00006_Permiso] ON
INSERT INTO [dbo].[tbl_G00006_Permiso] ([G00006_Id_Permiso], [G00006_Proceso], [G00006_Modulo], [G00006_Permiso])
VALUES
(1, 'Gestión de Usuarios', 'Administración', 'Crear Usuario'),
(2, 'Gestión de Usuarios', 'Administración', 'Modificar Usuario'),
(3, 'Gestión de Usuarios', 'Administración', 'Eliminar Usuario'),
(4, 'Gestión de Equipos', 'Equipos', 'Ver Equipos'),
(5, 'Gestión de Equipos', 'Equipos', 'Crear Equipo'),
(6, 'Gestión de Equipos', 'Equipos', 'Modificar Equipo'),
(7, 'Gestión de Equipos', 'Equipos', 'Eliminar Equipo'),
(8, 'Reportes', 'Reportes', 'Ver Reportes'),
(9, 'Reportes', 'Reportes', 'Generar Reportes'),
(10, 'Contabilidad', 'Finanzas', 'Ver Cuentas por Pagar'),
(11, 'Contabilidad', 'Finanzas', 'Crear Cuenta por Pagar'),
(12, 'Logística', 'Almacén', 'Ver Movimientos'),
(13, 'Logística', 'Almacén', 'Registrar Movimientos'),
(14, 'SSOMA', 'Seguridad', 'Ver Inspecciones'),
(15, 'SSOMA', 'Seguridad', 'Registrar Inspecciones')
SET IDENTITY_INSERT [dbo].[tbl_G00006_Permiso] OFF
GO

-- =============================================
-- 4. ROLE PERMISSIONS
-- =============================================
PRINT 'Inserting Role Permissions...'

SET IDENTITY_INSERT [dbo].[tbl_G00005_RolPermiso] ON
-- Admin has all permissions
INSERT INTO [dbo].[tbl_G00005_RolPermiso] ([G00005_Id_RolPermiso], [G00004_Id_Rol], [G00006_Id_Permiso])
SELECT ROW_NUMBER() OVER (ORDER BY [G00006_Id_Permiso]) as Id, 1 as RolId, [G00006_Id_Permiso] 
FROM [dbo].[tbl_G00006_Permiso]

-- Gerente General - most permissions
INSERT INTO [dbo].[tbl_G00005_RolPermiso] ([G00005_Id_RolPermiso], [G00004_Id_Rol], [G00006_Id_Permiso])
VALUES
(16, 2, 4), (17, 2, 5), (18, 2, 6), (19, 2, 8), (20, 2, 9), (21, 2, 10), (22, 2, 11),

-- Equipment Supervisor
(23, 4, 4), (24, 4, 5), (25, 4, 6), (26, 4, 8),

-- Operator - limited permissions
(27, 5, 4), (28, 5, 8),

-- Developer - system permissions
(29, 10, 1), (30, 10, 2), (31, 10, 3), (32, 10, 4), (33, 10, 5), (34, 10, 6), (35, 10, 7)

SET IDENTITY_INSERT [dbo].[tbl_G00005_RolPermiso] OFF
GO

-- =============================================
-- 5. USERS
-- =============================================
PRINT 'Inserting Users...'

INSERT INTO [dbo].[tbl_G00002_Usuario] 
([G00002_DNI], [G00002_Usuario], [G00002_Contraseña], [G00002_Email], [C10_CajaChica], [G00001_Id_UnidadOperativa], [G00002_Estado])
VALUES
('12345678', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'admin@bitcorp.com', NULL, 'UO00001', 'ACTIVO'),
('87654321', 'jgarcia', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'jgarcia@bitcorp.com', 'CC001', 'UO00001', 'ACTIVO'),
('11111111', 'mlopez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'mlopez@bitcorp.com', NULL, 'UO00002', 'ACTIVO'),
('22222222', 'crodriguez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'crodriguez@bitcorp.com', NULL, 'UO00003', 'ACTIVO'),
('33333333', 'aperez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'aperez@bitcorp.com', NULL, 'UO00002', 'ACTIVO'),
('44444444', 'jsanchez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'jsanchez@bitcorp.com', 'CC002', 'UO00004', 'ACTIVO'),
('55555555', 'ltorres', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'ltorres@bitcorp.com', NULL, 'UO00005', 'ACTIVO'),
('66666666', 'developer', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3X8PG/0ZxW', 'developer@bitcorp.com', NULL, 'UO00001', 'ACTIVO')
GO

-- =============================================
-- 6. USER ROLES
-- =============================================
PRINT 'Inserting User Roles...'

SET IDENTITY_INSERT [dbo].[tbl_G00003_UsuarioRol] ON
INSERT INTO [dbo].[tbl_G00003_UsuarioRol] ([G00003_Id_UsuarioRol], [G00002_DNI], [G00004_Id_Rol], [G00001_Id_UnidadOperatova])
VALUES
(1, '12345678', 1, 'UO00001'), -- admin as Administrador
(2, '87654321', 2, 'UO00001'), -- jgarcia as Gerente General
(3, '11111111', 3, 'UO00002'), -- mlopez as Jefe de Operaciones
(4, '22222222', 4, 'UO00003'), -- crodriguez as Supervisor de Equipos
(5, '33333333', 5, 'UO00002'), -- aperez as Operador
(6, '44444444', 6, 'UO00004'), -- jsanchez as Contador
(7, '55555555', 8, 'UO00005'), -- ltorres as Jefe de Logística
(8, '66666666', 10, 'UO00001') -- developer as Desarrollador
SET IDENTITY_INSERT [dbo].[tbl_G00003_UsuarioRol] OFF
GO

-- =============================================
-- 7. USER ROLE OPERATIONAL UNITS
-- =============================================
PRINT 'Inserting User Role Operational Units...'

SET IDENTITY_INSERT [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] ON
INSERT INTO [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] 
([G00003_Id_UsuarioRolUnidadOperativa], [G00002_DNI], [G00004_Id_Rol], [G00001_Id_UnidadOperativa])
VALUES
(1, '12345678', 1, 'UO00001'),
(2, '87654321', 2, 'UO00001'),
(3, '11111111', 3, 'UO00002'),
(4, '22222222', 4, 'UO00003'),
(5, '33333333', 5, 'UO00002'),
(6, '44444444', 6, 'UO00004'),
(7, '55555555', 8, 'UO00005'),
(8, '66666666', 10, 'UO00001')
SET IDENTITY_INSERT [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] OFF
GO

-- =============================================
-- 8. PROVIDERS (PROVEEDORES)
-- =============================================
PRINT 'Inserting Providers...'

INSERT INTO [dbo].[tbl_C07001_Proveedor] 
([C07001_RUC], [C07001_RazonSocial], [C07001_Direccion], [C07001_DniRepresentanteLegal], [C07001_RepresentanteLegal], 
[C07001_ProveedorDe], [C07001_ListaProductosServicios], [C07001_Contacto], [C07001_Correo], [C07001_Celular], 
[C07001_EntidadFinanciera], [C07001_CuentaCorriente], [C07001_CCI], [C07001_CuentaDetraccion], 
[C07001_FechaActualizacion], [C07001_ActualizadoPor])
VALUES
('20123456789', 'CATERPILLAR PERU S.A.C.', 'Av. República de Panamá 3420, San Isidro, Lima', '12345678', 'Carlos Mendoza Rivera', 
'Equipos Pesados', 'Excavadoras, Cargadores, Tractores, Volquetes', 'Carlos Mendoza / Ventas', 'ventas@caterpillar.pe', '987654321',
'Banco de Crédito del Perú', '194-1234567-8-90', '002-194-001234567890-15', '00-000-123456', GETDATE(), 'Sistema'),

('20234567890', 'KOMATSU MITSUI MAQUINARIAS PERU S.A.', 'Av. Cristóbal de Peralta Norte 968, Surco, Lima', '23456789', 'Ana Patricia Soto', 
'Equipos Pesados', 'Excavadoras, Bulldozers, Cargadores Frontales', 'Ana Soto / Gerente Comercial', 'asoto@komatsu.pe', '987123456',
'Banco Continental', '011-2345678-9-01', '011-011-002345678901-25', '00-000-234567', GETDATE(), 'Sistema'),

('20345678901', 'VOLVO CONSTRUCTION EQUIPMENT PERU S.A.C.', 'Av. Los Frutales 220, Ate, Lima', '34567890', 'Roberto Chávez Mendoza', 
'Equipos de Construcción', 'Excavadoras, Cargadores, Compactadores', 'Roberto Chávez / Director Comercial', 'rchavez@volvo.pe', '987234567',
'Interbank', '898-3456789-0-12', '003-898-003456789012-35', '00-000-345678', GETDATE(), 'Sistema'),

('20456789012', 'FERREYROS S.A.A.', 'Jr. Cristóbal de Peralta 915, Surco, Lima', '45678901', 'María Elena Vargas', 
'Distribución de Equipos', 'Venta y alquiler de maquinaria pesada, repuestos', 'María Vargas / Jefe de Ventas', 'mvargas@ferreyros.com.pe', '987345678',
'BBVA Continental', '011-4567890-1-23', '011-011-004567890123-45', '00-000-456789', GETDATE(), 'Sistema'),

('20567890123', 'TRANSPORTES RODRIGUEZ E.I.R.L.', 'Jr. Los Sauces 456, Villa El Salvador, Lima', '56789012', 'Luis Rodriguez Paredes', 
'Servicios de Transporte', 'Transporte de carga pesada, logística', 'Luis Rodriguez / Propietario', 'lrodriguez@transportes.com', '987456789',
'Banco de la Nación', '018-5678901-2-34', '018-018-005678901234-55', '00-000-567890', GETDATE(), 'Sistema')
GO

-- =============================================
-- 9. EQUIPMENT (EQUIPOS)
-- =============================================
PRINT 'Inserting Equipment...'

INSERT INTO [dbo].[tbl_C08001_Equipo] 
([C08001_CodigoEquipo], [C07001_RucProveedor], [C07001_RazonSocial], [C08001_TipoProveedor], [C08001_Equipo], 
[C08001_Placa], [C08001_DocAcredita], [C08001_FechaAcredita], [C08001_Marca], [C08001_Modelo], [C08001_SerieEquipo], 
[C08001_NumChasis], [C08001_SerieMotor], [C08001_PotenciaNeta], [C08001_AñoFabricacion], [C08001_FechaVencePoliza], 
[C08001_FechaVenceSOAT], [C08001_FechaVenceCITV], [C08001_CodigoExterno], [C08001_TipoHoroOdo], [C08001_HorometroOdometro], 
[C08001_TipoCombustible], [C08001_Estatus], [G00001_Id_UnidadOperativa], [C08001_FechaRegistro], [C08001_RegistradoPor], 
[C08001_FechaActualizacion], [C08001_ActualizadoPor])
VALUES
('EQ-001-2024', '20123456789', 'CATERPILLAR PERU S.A.C.', 'ALQUILER', 'EXCAVADORA', 'T8X-123', 'TARJETA-001', '2024-01-15', 
'CATERPILLAR', '320D', 'CAT123456789', 'CH123456789', 'MT987654321', '120 HP', '2020', '2025-12-31', '2025-06-30', '2025-03-15', 
'EXT-001', 'HOROMETRO', '2450', 'DIESEL', 'OPERATIVO', 'UO00001', '2024-01-15', 'admin', '2024-06-01', 'jgarcia'),

('EQ-002-2024', '20234567890', 'KOMATSU MITSUI MAQUINARIAS PERU S.A.', 'ALQUILER', 'CARGADOR FRONTAL', 'T9Y-456', 'TARJETA-002', '2024-02-10', 
'KOMATSU', 'WA320-7', 'KOM234567890', 'CH234567890', 'MT876543210', '140 HP', '2021', '2025-11-30', '2025-07-15', '2025-04-20', 
'EXT-002', 'HOROMETRO', '1890', 'DIESEL', 'OPERATIVO', 'UO00002', '2024-02-10', 'mlopez', '2024-06-05', 'crodriguez'),

('EQ-003-2024', '20345678901', 'VOLVO CONSTRUCTION EQUIPMENT PERU S.A.C.', 'ALQUILER', 'VOLQUETE', 'U1Z-789', 'TARJETA-003', '2024-03-05', 
'VOLVO', 'A40G', 'VOL345678901', 'CH345678901', 'MT765432109', '360 HP', '2019', '2025-10-31', '2025-08-30', '2025-05-25', 
'EXT-003', 'ODOMETRO', '87450', 'DIESEL', 'OPERATIVO', 'UO00003', '2024-03-05', 'crodriguez', '2024-06-10', 'aperez'),

('EQ-004-2024', '20123456789', 'CATERPILLAR PERU S.A.C.', 'PROPIO', 'BULLDOZER', 'V2A-012', 'TARJETA-004', '2024-04-12', 
'CATERPILLAR', 'D6T', 'CAT456789012', 'CH456789012', 'MT654321098', '200 HP', '2022', '2026-01-15', '2025-09-10', '2025-06-30', 
'EXT-004', 'HOROMETRO', '1230', 'DIESEL', 'OPERATIVO', 'UO00001', '2024-04-12', 'admin', '2024-06-15', 'jsanchez'),

('EQ-005-2024', '20456789012', 'FERREYROS S.A.A.', 'ALQUILER', 'MOTONIVELADORA', 'W3B-345', 'TARJETA-005', '2024-05-20', 
'CATERPILLAR', '12M3', 'FER567890123', 'CH567890123', 'MT543210987', '180 HP', '2021', '2025-12-20', '2025-10-15', '2025-07-10', 
'EXT-005', 'HOROMETRO', '3450', 'DIESEL', 'MANTENIMIENTO', 'UO00004', '2024-05-20', 'jsanchez', '2024-06-20', 'ltorres'),

('EQ-006-2024', '20567890123', 'TRANSPORTES RODRIGUEZ E.I.R.L.', 'TERCERO', 'CAMION CISTERNA', 'X4C-678', 'TARJETA-006', '2024-06-01', 
'VOLVO', 'FH460', 'TRA678901234', 'CH678901234', 'MT432109876', '460 HP', '2020', '2025-11-25', '2025-11-30', '2025-08-15', 
'EXT-006', 'ODOMETRO', '125000', 'DIESEL', 'OPERATIVO', 'UO00005', '2024-06-01', 'ltorres', '2024-06-25', 'admin'),

('EQ-007-2024', '20234567890', 'KOMATSU MITSUI MAQUINARIAS PERU S.A.', 'ALQUILER', 'COMPACTADORA', 'Y5D-901', 'TARJETA-007', '2024-06-15', 
'KOMATSU', 'BW213D-5', 'KOM789012345', 'CH789012345', 'MT321098765', '110 HP', '2023', '2026-06-15', '2025-12-15', '2025-09-20', 
'EXT-007', 'HOROMETRO', '580', 'DIESEL', 'OPERATIVO', 'UO00002', '2024-06-15', 'mlopez', '2024-06-30', 'aperez'),

('EQ-008-2024', '20123456789', 'CATERPILLAR PERU S.A.C.', 'PROPIO', 'RETROEXCAVADORA', 'Z6E-234', 'TARJETA-008', '2024-07-01', 
'CATERPILLAR', '420F2', 'CAT890123456', 'CH890123456', 'MT210987654', '95 HP', '2022', '2026-07-01', '2026-01-01', '2025-10-30', 
'EXT-008', 'HOROMETRO', '1150', 'DIESEL', 'OPERATIVO', 'UO00001', '2024-07-01', 'admin', '2024-07-05', 'admin')
GO

-- =============================================
-- 10. EDT (ESTRUCTURA DE DESGLOSE DEL TRABAJO)
-- =============================================
PRINT 'Inserting EDT...'

INSERT INTO [dbo].[tbl_A02001_EDT] 
([A02001_Id_EDT], [A02001_CodigoEDT], [A02001_EDT], [A02001_NivelEDT], [A02001_Especialidad], 
[A02001_TarifaLunes_Viernes], [A02001_TarifaSabado], [A02001_TarifaDomingo_Feriado], 
[G00001_Id_UnidadOperativa], [A02001_FechaRegistro], [A02001_RegistradoPor])
VALUES
('EDT001', 'EDT-001', 'Movimiento de Tierras - Excavación', 1, 'Excavación', 150.00, 180.00, 225.00, 'UO00001', '2024-01-01', 'admin'),
('EDT002', 'EDT-002', 'Carga y Transporte de Material', 1, 'Transporte', 120.00, 144.00, 180.00, 'UO00002', '2024-01-01', 'mlopez'),
('EDT003', 'EDT-003', 'Nivelación y Compactación', 1, 'Nivelación', 110.00, 132.00, 165.00, 'UO00003', '2024-01-01', 'crodriguez'),
('EDT004', 'EDT-004', 'Construcción de Accesos', 2, 'Construcción', 95.00, 114.00, 142.50, 'UO00004', '2024-01-01', 'jsanchez'),
('EDT005', 'EDT-005', 'Mantenimiento de Vías', 2, 'Mantenimiento', 85.00, 102.00, 127.50, 'UO00005', '2024-01-01', 'ltorres')
GO

-- =============================================
-- 11. WORKERS (TRABAJADORES)
-- =============================================
PRINT 'Inserting Workers...'

INSERT INTO [dbo].[tbl_C05000_Trabajador] 
([C05000_DNI], [C05000_Trabajador], [C05000_FechaNacimiento], [C05000_LugarNacimiento], 
[C05000_Direccion], [C05000_EstadoCivil], [C05000_Sexo], [C05000_GradoInstruccion], 
[C05000_Telefono], [C05000_Email], [C05000_ContactoEmergencia], [C05000_TelefonoEmergencia], 
[C05000_Cargo], [C05000_TipoContrato], [C05000_FechaIngreso], [C05000_FechaSalida], 
[C05000_SueldoBasico], [C05000_Estado])
VALUES
('70123456', 'Juan Carlos Mendoza Ríos', '1985-03-15', 'Lima', 'Av. Los Olivos 123, San Juan de Lurigancho', 'SOLTERO', 'M', 'TECNICO', 
'987654321', 'jmendoza@email.com', 'Rosa Ríos Vda. de Mendoza', '987123456', 'Operador de Excavadora', 'INDEFINIDO', '2024-01-15', NULL, 2500.00, 'ACTIVO'),

('70234567', 'María Elena Vargas Torres', '1990-07-22', 'Arequipa', 'Jr. Las Flores 456, Cercado de Lima', 'CASADO', 'F', 'UNIVERSITARIO', 
'987765432', 'mvargas@email.com', 'Pedro Vargas García', '987234567', 'Supervisora de Logística', 'INDEFINIDO', '2024-02-01', NULL, 3200.00, 'ACTIVO'),

('70345678', 'Carlos Alberto Sánchez Díaz', '1982-11-08', 'Cusco', 'Av. Universitaria 789, Los Olivos', 'CASADO', 'M', 'TECNICO', 
'987876543', 'csanchez@email.com', 'Ana Díaz de Sánchez', '987345678', 'Mecánico de Equipos Pesados', 'INDEFINIDO', '2024-01-20', NULL, 2800.00, 'ACTIVO'),

('70456789', 'Ana Patricia Flores Huamán', '1988-05-12', 'Trujillo', 'Jr. Los Claveles 321, Breña', 'SOLTERO', 'F', 'UNIVERSITARIO', 
'987987654', 'aflores@email.com', 'Luis Flores Mendoza', '987456789', 'Ingeniera de Seguridad', 'INDEFINIDO', '2024-03-01', NULL, 3500.00, 'ACTIVO'),

('70567890', 'Roberto Chávez Palomino', '1975-09-30', 'Piura', 'Av. Colonial 654, Callao', 'CASADO', 'M', 'SECUNDARIO', 
'987098765', 'rchavez@email.com', 'Carmen Palomino de Chávez', '987567890', 'Operador de Cargador Frontal', 'INDEFINIDO', '2024-02-15', NULL, 2300.00, 'ACTIVO')
GO

-- =============================================
-- 12. WORKER REGISTRATION
-- =============================================
PRINT 'Inserting Worker Registration...'

SET IDENTITY_INSERT [dbo].[tbl_C05027_RegistroTrabajador] ON
INSERT INTO [dbo].[tbl_C05027_RegistroTrabajador] 
([C05027_Id_RegistroTrabajador], [C05000_DNI], [C07001_RUC], [G00001_Id_UnidadOperativa], 
[C05027_FechaInicio], [C05027_FechaFin], [C05027_Estado])
VALUES
(1, '70123456', '20123456789', 'UO00001', '2024-01-15', NULL, 'ACTIVO'),
(2, '70234567', '20456789012', 'UO00004', '2024-02-01', NULL, 'ACTIVO'),
(3, '70345678', '20234567890', 'UO00002', '2024-01-20', NULL, 'ACTIVO'),
(4, '70456789', '20345678901', 'UO00003', '2024-03-01', NULL, 'ACTIVO'),
(5, '70567890', '20123456789', 'UO00001', '2024-02-15', NULL, 'ACTIVO')
SET IDENTITY_INSERT [dbo].[tbl_C05027_RegistroTrabajador] OFF
GO

-- =============================================
-- 13. COST CENTERS
-- =============================================
PRINT 'Inserting Cost Centers...'

INSERT INTO [dbo].[tbl_C04001_CentroCosto] 
([C04001_CodPartida], [C04001_Partida], [C04001_UM], [C04001_PrecioUnitario], [C04001_TipoRecurso])
VALUES
('CC-001', 'Excavación con maquinaria pesada', 'M3', 25.50, 'EQUIPO'),
('CC-002', 'Transporte de material excedente', 'M3', 18.75, 'EQUIPO'),
('CC-003', 'Nivelación y compactación', 'M2', 12.30, 'EQUIPO'),
('CC-004', 'Mantenimiento preventivo de equipos', 'HH', 45.00, 'SERVICIO'),
('CC-005', 'Combustible para equipos pesados', 'GL', 4.20, 'MATERIAL'),
('CC-006', 'Operación de cargador frontal', 'HH', 85.00, 'EQUIPO'),
('CC-007', 'Supervisión técnica de obras', 'HH', 65.00, 'PERSONAL'),
('CC-008', 'Alquiler de equipos menores', 'DIA', 150.00, 'EQUIPO')
GO

-- =============================================
-- 14. ACCOUNTS PAYABLE
-- =============================================
PRINT 'Inserting Accounts Payable...'

INSERT INTO [dbo].[tbl_C04002_CuentasPorPagar] 
([C04002_IdCuentaPagar], [C04002_DNI_RUC], [C04002_RazonSocial], [C04002_FechaEmision], 
[C04002_Comprobante], [C04002_Serie], [C04002_Numero], [C04002_Concepto], [C04002_Moneda], 
[C04002_MontoSinIGV], [C04002_MontoIGV], [C04002_MontoConIGV], [C04002_PorceDetraccion], 
[C04002_MontoDetraccion], [C04002_MontoRetencion], [C04002_MontoFinal], [C04002_FechaRegistro])
VALUES
('CP-2024-001', '20123456789', 'CATERPILLAR PERU S.A.C.', '2024-06-01', 'FACTURA', 'F001', '000123', 'Alquiler Excavadora EQ-001-2024 - Junio 2024', 'SOLES', 
42372.88, 7627.12, 50000.00, 12.00, 6000.00, 0.00, 44000.00, '2024-06-01'),

('CP-2024-002', '20234567890', 'KOMATSU MITSUI MAQUINARIAS PERU S.A.', '2024-06-05', 'FACTURA', 'F002', '000456', 'Alquiler Cargador Frontal EQ-002-2024 - Junio 2024', 'SOLES', 
33898.31, 6101.69, 40000.00, 12.00, 4800.00, 0.00, 35200.00, '2024-06-05'),

('CP-2024-003', '20345678901', 'VOLVO CONSTRUCTION EQUIPMENT PERU S.A.C.', '2024-06-10', 'FACTURA', 'F003', '000789', 'Alquiler Volquete EQ-003-2024 - Junio 2024', 'SOLES', 
25423.73, 4576.27, 30000.00, 12.00, 3600.00, 0.00, 26400.00, '2024-06-10'),

('CP-2024-004', '20456789012', 'FERREYROS S.A.A.', '2024-06-15', 'FACTURA', 'F004', '001012', 'Alquiler Motoniveladora EQ-005-2024 - Junio 2024', 'SOLES', 
16949.15, 3050.85, 20000.00, 12.00, 2400.00, 0.00, 17600.00, '2024-06-15'),

('CP-2024-005', '20567890123', 'TRANSPORTES RODRIGUEZ E.I.R.L.', '2024-06-20', 'FACTURA', 'F005', '000345', 'Servicio de Transporte - Junio 2024', 'SOLES', 
8474.58, 1525.42, 10000.00, 10.00, 1000.00, 0.00, 9000.00, '2024-06-20')
GO

-- =============================================
-- 15. EQUIPMENT TYPE
-- =============================================
PRINT 'Inserting Equipment Types...'

INSERT INTO [dbo].[tbl_C08009_TipoEquipo] 
([C08009_IdTipoEquipo], [C08009_TipoEquipo])
VALUES
('EX', 'Excavadora'),
('CF', 'Cargador Frontal'),
('VQ', 'Volquete'),
('BD', 'Bulldozer'),
('MN', 'Motoniveladora'),
('CC', 'Camión Cisterna'),
('CP', 'Compactadora'),
('RE', 'Retroexcavadora'),
('GR', 'Grúa'),
('TR', 'Tractor')
GO

-- =============================================
-- 16. PAYMENT METHODS (SUNAT)
-- =============================================
PRINT 'Inserting Payment Methods...'

INSERT INTO [dbo].[tbl_SUNAT01_TipoMedioPago] 
([SUNAT01_Id_Pago], [SUNAT01_TipoMedioPago], [SUNAT01_MedioPago])
VALUES
('001', 'Depósito en cuenta', 'DEPOSITO'),
('002', 'Giro', 'GIRO'),
('003', 'Transferencia de fondos', 'TRANSFER'),
('004', 'Orden de pago', 'ORDEN'),
('005', 'Tarjeta de débito', 'T_DEBITO'),
('006', 'Tarjeta de crédito emitida en el país por una empresa del sistema financiero', 'T_CREDITO'),
('007', 'Cheques con la cláusula de "no negociable"', 'CHEQUE'),
('008', 'Efectivo', 'EFECTIVO'),
('009', 'Efectivo, por operaciones en las que no existe obligación de utilizar medio de pago', 'EFECTIVO_S')
GO

-- =============================================
-- 17. UNIT OF MEASURE (SUNAT)
-- =============================================
PRINT 'Inserting Units of Measure...'

INSERT INTO [dbo].[tbl_SUNAT06_UnidadMedida] 
([SUNAT06_Id_UM], [SUNAT06_UnidadMedida], [SUNAT06_UM])
VALUES
('NIU', 'Unidad (Bienes)', 'UND'),
('ZZ', 'Unidad (Servicios)', 'SER'),
('HUR', 'Hora', 'HR'),
('DAY', 'Día', 'DIA'),
('MTQ', 'Metro cúbico', 'M3'),
('MTR', 'Metro', 'M'),
('KGM', 'Kilogramo', 'KG'),
('LTR', 'Litro', 'LT'),
('GLI', 'Galón (Reino Unido)', 'GAL'),
('GLL', 'Galón (Estados Unidos)', 'GALUS')
GO

-- =============================================
-- 18. DOCUMENT TYPES (SUNAT)
-- =============================================
PRINT 'Inserting Document Types...'

INSERT INTO [dbo].[tbl_SUNAT10_TipoComprobante] 
([SUNAT10_CodigoTipoComprobante], [SUNAT10_TipoComprobante], [SUNAT10_Comprobante])
VALUES
('01', 'Factura', 'FACTURA'),
('03', 'Boleta de Venta', 'BOLETA'),
('07', 'Nota de Crédito', 'N_CREDITO'),
('08', 'Nota de Débito', 'N_DEBITO'),
('09', 'Guía de Remisión - Remitente', 'GUIA_REM'),
('12', 'Ticket o cinta emitido por máquina registradora', 'TICKET'),
('14', 'Recibo por servicios públicos', 'RECIBO_SP'),
('18', 'Documentos emitidos por las AFP', 'DOC_AFP'),
('20', 'Comprobante de Retención', 'RETENCION'),
('40', 'Constancia de depósito de detracción', 'DETRACCION')
GO

-- =============================================
-- 19. OPERATION TYPES (SUNAT)
-- =============================================
PRINT 'Inserting Operation Types...'

INSERT INTO [dbo].[tbl_SUNAT12_TipoOperacion] 
([SUNAT12_TipoOperacion], [SUNAT12_Cod_Operacion], [SUNAT12_IngresoSalida], [SUNAT12_DocInterno], [SUNAT12_ClienteProveedor])
VALUES
('Venta interna', '01', 'INGRESO', 'FACTURA', 'CLIENTE'),
('Exportación', '02', 'INGRESO', 'FACTURA', 'CLIENTE'),
('No domiciliados', '03', 'INGRESO', 'FACTURA', 'CLIENTE'),
('Venta interna - Anticipos', '04', 'INGRESO', 'FACTURA', 'CLIENTE'),
('Venta itinerante', '05', 'INGRESO', 'BOLETA', 'CLIENTE'),
('Compra', '06', 'SALIDA', 'FACTURA', 'PROVEEDOR'),
('Compra - No domiciliado', '07', 'SALIDA', 'FACTURA', 'PROVEEDOR'),
('Compra - Anticipos', '08', 'SALIDA', 'FACTURA', 'PROVEEDOR')
GO

-- Re-enable foreign key constraints
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
GO

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
PRINT '============================================='
PRINT 'DATA INSERTION COMPLETED SUCCESSFULLY!'
PRINT '============================================='
PRINT ''

-- Show record counts
PRINT 'RECORD COUNTS:'
SELECT 'tbl_G00001_UnidadOperativa' as TableName, COUNT(*) as RecordCount FROM [dbo].[tbl_G00001_UnidadOperativa]
UNION ALL SELECT 'tbl_G00004_Rol', COUNT(*) FROM [dbo].[tbl_G00004_Rol]
UNION ALL SELECT 'tbl_G00006_Permiso', COUNT(*) FROM [dbo].[tbl_G00006_Permiso]
UNION ALL SELECT 'tbl_G00005_RolPermiso', COUNT(*) FROM [dbo].[tbl_G00005_RolPermiso]
UNION ALL SELECT 'tbl_G00002_Usuario', COUNT(*) FROM [dbo].[tbl_G00002_Usuario]
UNION ALL SELECT 'tbl_G00003_UsuarioRol', COUNT(*) FROM [dbo].[tbl_G00003_UsuarioRol]
UNION ALL SELECT 'tbl_C07001_Proveedor', COUNT(*) FROM [dbo].[tbl_C07001_Proveedor]
UNION ALL SELECT 'tbl_C08001_Equipo', COUNT(*) FROM [dbo].[tbl_C08001_Equipo]
UNION ALL SELECT 'tbl_A02001_EDT', COUNT(*) FROM [dbo].[tbl_A02001_EDT]
UNION ALL SELECT 'tbl_C05000_Trabajador', COUNT(*) FROM [dbo].[tbl_C05000_Trabajador]
UNION ALL SELECT 'tbl_C04001_CentroCosto', COUNT(*) FROM [dbo].[tbl_C04001_CentroCosto]
UNION ALL SELECT 'tbl_C04002_CuentasPorPagar', COUNT(*) FROM [dbo].[tbl_C04002_CuentasPorPagar]
UNION ALL SELECT 'tbl_C08009_TipoEquipo', COUNT(*) FROM [dbo].[tbl_C08009_TipoEquipo]
ORDER BY TableName

PRINT ''
PRINT 'Sample Equipment Data:'
SELECT TOP 3 [C08001_CodigoEquipo], [C08001_Equipo], [C08001_Marca], [C08001_Modelo], [C08001_Estatus] 
FROM [dbo].[tbl_C08001_Equipo]

PRINT ''
PRINT 'Sample User Data:'
SELECT [G00002_DNI], [G00002_Usuario], [G00002_Email], [G00002_Estado] 
FROM [dbo].[tbl_G00002_Usuario]

PRINT ''
PRINT 'Database populated with comprehensive dummy data for Bitcorp ERP!'
PRINT 'You can now test the application with realistic test data.'
