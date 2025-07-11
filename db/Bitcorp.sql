USE [master]
GO
/****** Object:  Database [dbBitCorp]    Script Date: 4/07/2025 22:01:45 ******/
CREATE DATABASE [dbBitCorp]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'dbAramsa_Data', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\dbAramsa.mdf' , SIZE = 28672KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'dbAramsa_Log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\dbAramsa.ldf' , SIZE = 13248KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [dbBitCorp] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [dbBitCorp].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [dbBitCorp] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [dbBitCorp] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [dbBitCorp] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [dbBitCorp] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [dbBitCorp] SET ARITHABORT OFF 
GO
ALTER DATABASE [dbBitCorp] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [dbBitCorp] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [dbBitCorp] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [dbBitCorp] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [dbBitCorp] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [dbBitCorp] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [dbBitCorp] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [dbBitCorp] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [dbBitCorp] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [dbBitCorp] SET  ENABLE_BROKER 
GO
ALTER DATABASE [dbBitCorp] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [dbBitCorp] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [dbBitCorp] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [dbBitCorp] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [dbBitCorp] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [dbBitCorp] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [dbBitCorp] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [dbBitCorp] SET RECOVERY FULL 
GO
ALTER DATABASE [dbBitCorp] SET  MULTI_USER 
GO
ALTER DATABASE [dbBitCorp] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [dbBitCorp] SET DB_CHAINING OFF 
GO
ALTER DATABASE [dbBitCorp] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [dbBitCorp] SET TARGET_RECOVERY_TIME = 120 SECONDS 
GO
ALTER DATABASE [dbBitCorp] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [dbBitCorp] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [dbBitCorp] SET QUERY_STORE = ON
GO
ALTER DATABASE [dbBitCorp] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 100, QUERY_CAPTURE_MODE = ALL, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [dbBitCorp]
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 8;
GO
USE [dbBitCorp]
GO
/****** Object:  User [C10UserRptuser]    Script Date: 4/07/2025 22:01:45 ******/
CREATE USER [C10UserRptuser] FOR LOGIN [C10UserRpt] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_datareader] ADD MEMBER [C10UserRptuser]
GO
/****** Object:  Table [dbo].[tbl_C06010_Movimiento]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06010_Movimiento](
	[C06010_NumRegistro] [int] IDENTITY(1,1) NOT NULL,
	[SUNAT12_TipoOperacion] [varchar](50) NULL,
	[C06010_TipoCompra] [varchar](20) NULL,
	[SUNAT10_TipoComprobante] [varchar](50) NULL,
	[C06010_SerieDoc] [varchar](10) NULL,
	[C06010_NumDoc] [int] NULL,
	[C06010_FechaOperacion] [date] NULL,
	[C06010_Vale] [varchar](20) NULL,
	[C06010_NumVale] [int] NULL,
	[C06010_TrabajadorProveedor] [varchar](10) NULL,
	[C06010_DNI_RUC] [varchar](11) NULL,
	[C06010_RazonSocial] [varchar](100) NULL,
	[C06010_CodigoEquipo] [varchar](20) NULL,
	[C06010_Equipo] [varchar](100) NULL,
	[C06010_HorometroOdometro] [decimal](9, 2) NULL,
	[C06010_CodigoEDT] [varchar](10) NULL,
	[C06010_EDT] [varchar](150) NULL,
	[C06010_IngresoSalida] [varchar](7) NULL,
	[C06010_Observaciones] [varchar](100) NULL,
	[C06010_FechaRegistro] [smalldatetime] NULL,
	[C06010_DNI_Usuario] [varchar](8) NULL,
	[C06010_Usuario] [varchar](50) NULL,
	[G00001_Id_UnidadOperativa] [varchar](10) NULL,
	[C06010_FechaUModificacion] [smalldatetime] NULL,
	[C06010_ModificadoPor] [varchar](50) NULL,
	[C06010_FleteSinIGV_T] [smallmoney] NULL,
	[C06010_DNI_RUC_T] [varchar](11) NULL,
	[C06010_RazonSocial_T] [varchar](100) NULL,
	[SUNAT10_TipoComprobante_T] [varchar](50) NULL,
	[C06010_NumDoc_T] [varchar](20) NULL,
 CONSTRAINT [PK_tbl_C06010_Movimiento] PRIMARY KEY CLUSTERED 
(
	[C06010_NumRegistro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06011_DetalleMovimiento]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06011_DetalleMovimiento](
	[C06011_NumDetalleMovi] [int] NOT NULL,
	[C06011_CodigoProducto] [varchar](20) NULL,
	[C06011_Producto] [varchar](100) NULL,
	[C06011_Cantidad] [decimal](9, 4) NULL,
	[C06011_UM] [varchar](10) NULL,
	[C06011_CostoUnitSinFlete] [money] NULL,
	[C06011_ImporteSinFlete] [money] NULL,
	[C06011_CostoUnitConFlete] [money] NULL,
	[C06011_ImporteConFlete] [money] NULL,
	[C06010_NumRegistro] [int] NULL,
 CONSTRAINT [PK_tbl_C06011_DetalleMovimiento] PRIMARY KEY CLUSTERED 
(
	[C06011_NumDetalleMovi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vst_306_MovimientoAlmacen]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vst_306_MovimientoAlmacen]
AS
SELECT        dbo.tbl_C06010_Movimiento.*, dbo.tbl_C06011_DetalleMovimiento.C06011_NumDetalleMovi, dbo.tbl_C06011_DetalleMovimiento.C06011_CodigoProducto, dbo.tbl_C06011_DetalleMovimiento.C06011_Producto, 
                         dbo.tbl_C06011_DetalleMovimiento.C06011_Cantidad, dbo.tbl_C06011_DetalleMovimiento.C06011_UM, dbo.tbl_C06011_DetalleMovimiento.C06011_CostoUnitSinFlete, 
                         dbo.tbl_C06011_DetalleMovimiento.C06011_ImporteSinFlete, dbo.tbl_C06011_DetalleMovimiento.C06011_CostoUnitConFlete, dbo.tbl_C06011_DetalleMovimiento.C06011_ImporteConFlete
FROM            dbo.tbl_C06010_Movimiento INNER JOIN
                         dbo.tbl_C06011_DetalleMovimiento ON dbo.tbl_C06010_Movimiento.C06010_NumRegistro = dbo.tbl_C06011_DetalleMovimiento.C06010_NumRegistro
GO
/****** Object:  Table [dbo].[tbl_G00002_Usuario]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00002_Usuario](
	[G00002_DNI] [varchar](8) NOT NULL,
	[G00002_Usuario] [varchar](50) NULL,
	[G00002_Contraseña] [varchar](50) NULL,
	[G00002_Email] [varchar](50) NULL,
	[C10_CajaChica] [varchar](50) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[G00002_Estado] [varchar](8) NULL,
 CONSTRAINT [PK_tbl_000_Usuario] PRIMARY KEY CLUSTERED 
(
	[G00002_DNI] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00003_UsuarioRol]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00003_UsuarioRol](
	[G00003_Id_UsuarioRol] [int] IDENTITY(1,1) NOT NULL,
	[G00002_DNI] [varchar](8) NULL,
	[G00004_Id_Rol] [int] NULL,
	[G00001_Id_UnidadOperatova] [varchar](7) NULL,
 CONSTRAINT [PK_tbl_000_UsuarioRol] PRIMARY KEY CLUSTERED 
(
	[G00003_Id_UsuarioRol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00004_Rol]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00004_Rol](
	[G00004_Id_Rol] [int] IDENTITY(1,1) NOT NULL,
	[G00004_Rol] [varchar](50) NULL,
 CONSTRAINT [PK_000_Rol] PRIMARY KEY CLUSTERED 
(
	[G00004_Id_Rol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00005_RolPermiso]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00005_RolPermiso](
	[G00005_Id_RolPermiso] [int] IDENTITY(1,1) NOT NULL,
	[G00004_Id_Rol] [int] NULL,
	[G00006_Id_Permiso] [int] NULL,
 CONSTRAINT [PK_tbl_000_RolPermiso] PRIMARY KEY CLUSTERED 
(
	[G00005_Id_RolPermiso] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00006_Permiso]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00006_Permiso](
	[G00006_Id_Permiso] [int] IDENTITY(1,1) NOT NULL,
	[G00006_Proceso] [varchar](50) NULL,
	[G00006_Modulo] [varchar](50) NULL,
	[G00006_Permiso] [varchar](50) NULL,
 CONSTRAINT [PK_000_PermisoRol] PRIMARY KEY CLUSTERED 
(
	[G00006_Id_Permiso] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vst_UsuarioRolPermiso]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vst_UsuarioRolPermiso]
AS
SELECT        dbo.tbl_G00002_Usuario.G00002_DNI, dbo.tbl_G00002_Usuario.G00002_Usuario, dbo.tbl_G00004_Rol.G00004_Rol, dbo.tbl_G00006_Permiso.G00006_Permiso, dbo.tbl_G00006_Permiso.G00006_Proceso
FROM            dbo.tbl_G00002_Usuario INNER JOIN
                         dbo.tbl_G00003_UsuarioRol ON dbo.tbl_G00002_Usuario.G00002_DNI = dbo.tbl_G00003_UsuarioRol.G00002_DNI INNER JOIN
                         dbo.tbl_G00004_Rol ON dbo.tbl_G00003_UsuarioRol.G00004_Id_Rol = dbo.tbl_G00004_Rol.G00004_Id_Rol INNER JOIN
                         dbo.tbl_G00005_RolPermiso ON dbo.tbl_G00004_Rol.G00004_Id_Rol = dbo.tbl_G00005_RolPermiso.G00004_Id_Rol INNER JOIN
                         dbo.tbl_G00006_Permiso ON dbo.tbl_G00005_RolPermiso.G00006_Id_Permiso = dbo.tbl_G00006_Permiso.G00006_Id_Permiso
GO
/****** Object:  Table [dbo].[tbl_A02001_EDT]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_A02001_EDT](
	[A02001_Id_EDT] [int] NOT NULL,
	[A02001_Cod_EDT] [varchar](20) NULL,
	[A02001_EDT] [varchar](150) NULL,
	[A02001_UM] [varchar](10) NULL,
	[A02001_Cod_EDT_Alfanumerico] [varchar](10) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NOT NULL,
	[G00001_Estado] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_A02001_EDT] PRIMARY KEY CLUSTERED 
(
	[A02001_Id_EDT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C02000_ListaActoCondicionInseguro]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C02000_ListaActoCondicionInseguro](
	[C02000_CodigoActoCondicion] [varchar](5) NOT NULL,
	[C02000_ActoCondicion] [varchar](100) NULL,
	[C02000_CategoriaActoCondicionn] [varchar](20) NULL,
 CONSTRAINT [PK_tbl_C02000_ListaActoCondicionInseguro] PRIMARY KEY CLUSTERED 
(
	[C02000_CodigoActoCondicion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C02091_SeguimientoInspeccionSSOMA]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C02091_SeguimientoInspeccionSSOMA](
	[C02091_NumRegistro] [int] IDENTITY(1,1) NOT NULL,
	[C02091_FechaHallazgo] [smalldatetime] NULL,
	[C02091_LugarHallazgo] [varchar](50) NULL,
	[C02091_TipoInspeccion] [varchar](20) NULL,
	[C02091_Inspector_DNI] [varchar](8) NULL,
	[C02091_Inspector] [varchar](100) NULL,
	[C02091_DescripcionHallazgo] [varchar](250) NULL,
	[C02091_LinkFoto] [varchar](250) NULL,
	[C02091_NivelRiesgo] [varchar](10) NULL,
	[C02091_CausasHallazgo] [varchar](250) NULL,
	[C02091_ResponsableSubsanacion] [varchar](100) NULL,
	[C02091_FechaSubsanacion] [date] NULL,
	[C02091_Estado] [varchar](20) NULL,
 CONSTRAINT [PK_tbl_C02091_SeguimientoInspeccionSSOMA] PRIMARY KEY CLUSTERED 
(
	[C02091_NumRegistro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C020911_SeguimientoInspeccion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C020911_SeguimientoInspeccion](
	[C020911_NumRegistro] [int] NOT NULL,
	[C020911_Fecha] [smalldatetime] NULL,
	[C020911_InspectorDNI] [nchar](10) NULL,
	[C020911_Inspector] [varchar](100) NULL,
	[C020911_DescripcionInspeccion] [varchar](250) NULL,
	[C020911_LinkEvidencia] [varchar](200) NULL,
	[C020911_FechaProximaInspeccion] [date] NULL,
	[C020911_AvanceEstimado] [int] NULL,
	[C02091_NumRegistro] [int] NOT NULL,
 CONSTRAINT [PK_tbl_C020911_SeguimientoInspeccion] PRIMARY KEY CLUSTERED 
(
	[C020911_NumRegistro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C02105_ReporteActoCondicion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C02105_ReporteActoCondicion](
	[C02105_0NumRegistro] [int] IDENTITY(1,1) NOT NULL,
	[C02105_0FechaRegistro] [smalldatetime] NULL,
	[C02105_0RegistradoPorDNI] [varchar](8) NULL,
	[C02105_0RegistradoPor] [varchar](60) NULL,
	[C02105_0ModificadoPor] [varchar](100) NULL,
	[C02105_0FechaModificacion] [smalldatetime] NULL,
	[G00001_Id_UnidadOperativa] [varchar](10) NULL,
	[C02105_1ReportadoPorDNI] [varchar](8) NULL,
	[C02105_1ReportadoPor] [varchar](60) NULL,
	[C02105_1Cargo] [varchar](50) NULL,
	[C02105_1Empresa] [varchar](100) NULL,
	[C02105_2Fecha] [smalldatetime] NULL,
	[C02105_2Lugar] [varchar](30) NULL,
	[C02105_2Empresa] [varchar](50) NULL,
	[C02105_2SistemaGestion] [varchar](20) NULL,
	[C02105_2TipoReporte] [varchar](20) NULL,
	[C02105_2CodigoActoCondicion] [varchar](10) NULL,
	[C02105_2ActoCondicion] [varchar](100) NULL,
	[C02105_2DañoA] [varchar](200) NULL,
	[C02105_2Descripcion] [varchar](200) NULL,
	[C02105_3ComoActue] [varchar](200) NULL,
	[C02105_3Estado] [varchar](10) NULL,
	[C02105_4_1PorQue] [varchar](100) NULL,
	[C02105_4_2PorQue] [varchar](100) NULL,
	[C02105_4_3PorQue] [varchar](100) NULL,
	[C02105_4_4PorQue] [varchar](100) NULL,
	[C02105_4_5PorQue] [varchar](100) NULL,
	[C02105_5AccionCorrectiva] [varchar](200) NULL,
 CONSTRAINT [PK_C02105_ReporteActoCondicion] PRIMARY KEY CLUSTERED 
(
	[C02105_0NumRegistro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04001_CentroCosto]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04001_CentroCosto](
	[C04001_CodPartida] [varchar](12) NOT NULL,
	[C04001_Partida] [varchar](60) NULL,
	[C04001_CodPartidaN3] [varchar](10) NULL,
	[C04001_PartidaN3] [varchar](60) NULL,
	[C04001_CodPartidaN2] [varchar](10) NULL,
	[C04001_PartidaN2] [varchar](60) NULL,
	[C04001_CodPartidaN1] [varchar](10) NULL,
	[C04001_PartidaN1] [varchar](60) NULL,
	[C04001_Orden] [int] NULL,
 CONSTRAINT [PK_tbl_C04001_CentroCosto] PRIMARY KEY CLUSTERED 
(
	[C04001_CodPartida] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04002_CuentasPorPagar]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04002_CuentasPorPagar](
	[C04002_IdCuentaPagar] [varchar](15) NOT NULL,
	[C04002_DNI_RUC] [varchar](11) NULL,
	[C04002_RazonSocial] [varchar](100) NULL,
	[C04002_FechaEmision] [date] NULL,
	[C04002_Comprobante] [varchar](20) NULL,
	[C04002_Serie] [varchar](10) NULL,
	[C04002_Numero] [varchar](22) NULL,
	[C04002_ProductoServicio] [varchar](10) NULL,
	[C04002_Concepto] [varchar](200) NULL,
	[C04002_Moneda] [varchar](10) NULL,
	[C04002_MontoSinIGV] [money] NULL,
	[C04002_IGV] [varchar](2) NULL,
	[C04002_MontoIGV] [smallmoney] NULL,
	[C04002_MontoConIGV] [money] NULL,
	[C04002_Detraccion] [varchar](2) NULL,
	[C04002_PorceDetraccion] [decimal](3, 2) NULL,
	[C04002_MontoDetraccion] [smallmoney] NULL,
	[C04002_EstatusDetraccion] [varchar](10) NULL,
	[C04002_FechaPagoDetraccion] [date] NULL,
	[C04002_Retencion] [varchar](2) NULL,
	[C04002_MontoRetencion] [money] NULL,
	[C04002_MontoFinal] [money] NULL,
	[G00007_CodComponente] [varchar](7) NULL,
	[C04001_CodCentroCosto] [varchar](12) NULL,
	[C04002_CentroCosto] [varchar](60) NULL,
	[C04002_FechaCierreServicio] [date] NULL,
	[C04002_FechaRecepcion] [date] NULL,
	[C04002_FormaPago] [varchar](10) NULL,
	[C04002_FechaVencimiento] [date] NULL,
	[C04002_Sustento] [varchar](100) NULL,
	[C04002_Link] [varchar](100) NULL,
	[C04002_FechaRegistro] [datetime] NULL,
	[C04002_RegistradoPor] [varchar](100) NULL,
	[C04002_Actualizado] [datetime] NULL,
	[C04002_ActualizadoPor] [varchar](100) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C04002_EstatusCuentaPorPgar] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_C04002_CuentasPorPagar] PRIMARY KEY CLUSTERED 
(
	[C04002_IdCuentaPagar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04003_AdminCentroCosto]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04003_AdminCentroCosto](
	[C04002_IdCuentaPagar] [varchar](15) NOT NULL,
	[C04003_IdAdminCC] [int] NOT NULL,
	[C04003_CodComponente] [varchar](7) NULL,
	[C04001_CodCentroCosto] [varchar](12) NULL,
	[C04003_CentroCosto] [varchar](60) NULL,
	[C04003_Porcentaje] [smallint] NULL,
	[C04003_MontoFinal] [money] NULL,
 CONSTRAINT [PK_tbl_C04003_AdminCentroCosto] PRIMARY KEY CLUSTERED 
(
	[C04003_IdAdminCC] ASC,
	[C04002_IdCuentaPagar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04004_ProgramacionPago]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04004_ProgramacionPago](
	[C04004_NumProgramacion] [varchar](11) NOT NULL,
	[C04004_ElaboradoPor] [varchar](100) NULL,
	[C04004_Elaboración] [datetime] NULL,
	[C04004_RevisadoPor] [varchar](100) NULL,
	[C04004_Revision] [datetime] NULL,
	[C04004_AprobadoPor] [varchar](100) NULL,
	[C04004_Aprobacion] [datetime] NULL,
	[C04004_LinkPDF] [varchar](100) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C04004_Actualizado] [datetime] NULL,
	[C04004_ActualizadoPor] [varchar](100) NULL,
	[C04004_Estatus] [varchar](10) NULL,
	[C04004_PPC] [decimal](3, 2) NULL,
 CONSTRAINT [PK_tbl_C04004_ProgramacionPago] PRIMARY KEY CLUSTERED 
(
	[C04004_NumProgramacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04005_DetalleProgramacionPago]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04005_DetalleProgramacionPago](
	[C04004_NumProgramacion] [varchar](11) NOT NULL,
	[C04005_Item] [int] NOT NULL,
	[C04002_IdCuentaPagar] [varchar](15) NULL,
	[C04005_DNI_RUC] [varchar](11) NULL,
	[C04005_RazonSocial] [varchar](100) NULL,
	[C04002_Comprobante] [varchar](10) NULL,
	[C04002_NumComprobante] [varchar](30) NULL,
	[C04005_Concepto] [varchar](200) NULL,
	[C04005_Moneda] [varchar](10) NULL,
	[C04005_MontoFinal] [money] NULL,
	[C04005_MontoPagado] [money] NULL,
	[C04005_MontoProgramado] [money] NULL,
	[C04005_LugarPago] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_C04004_ProgramacionPagos] PRIMARY KEY CLUSTERED 
(
	[C04004_NumProgramacion] ASC,
	[C04005_Item] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04006_CuentaCajaBanco]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04006_CuentaCajaBanco](
	[C04005_NumCuenta] [varchar](20) NOT NULL,
	[C04005_Cuenta] [varchar](50) NULL,
	[C04005_AccesoProyecto] [varchar](2) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C04005_Estatus] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_CuentaCajaBanco] PRIMARY KEY CLUSTERED 
(
	[C04005_NumCuenta] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04007_FlujoCajaBanco]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04007_FlujoCajaBanco](
	[C04007_IdMovim] [varchar](15) NOT NULL,
	[C04007_TipoMovimiento] [varchar](7) NULL,
	[C04007_FechaMovimiento] [date] NULL,
	[C04007_NumCuentaOrigen] [varchar](20) NULL,
	[C04007_CuentaOrigen] [varchar](100) NULL,
	[C04007_NumCuentaDestino] [varchar](20) NULL,
	[C04007_CuentaDestino] [varchar](100) NULL,
	[C04007_Concepto] [varchar](200) NULL,
	[C04007_Moneda] [varchar](10) NULL,
	[C04007_Total] [money] NULL,
	[C04007_TotalLetra] [varchar](100) NULL,
	[C04007_Voucher] [varchar](100) NULL,
	[C04007_LinkVoucher] [varchar](100) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C04007_RegistradoPor] [varchar](100) NULL,
	[C04007_FechaRegistro] [datetime] NULL,
	[C04007_ActualizadoPor] [varchar](100) NULL,
	[C04007_FechaActualizacion] [datetime] NULL,
 CONSTRAINT [PK_tbl_C04007_FlujoCajaBanco] PRIMARY KEY CLUSTERED 
(
	[C04007_IdMovim] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C04008_DetalleMovimiento]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C04008_DetalleMovimiento](
	[C04007_IdMovim] [varchar](15) NOT NULL,
	[C04008_Item] [int] NOT NULL,
	[C04004_NumProgramacion] [varchar](11) NOT NULL,
	[C04002_IdCuentaPagar] [varchar](15) NOT NULL,
	[C04008_Concepto] [varchar](50) NULL,
	[Clasificacion] [varchar](30) NULL,
	[C04008_Monto] [money] NULL,
 CONSTRAINT [PK_tbl_C04008_DetalleMovimiento] PRIMARY KEY CLUSTERED 
(
	[C04007_IdMovim] ASC,
	[C04008_Item] ASC,
	[C04004_NumProgramacion] ASC,
	[C04002_IdCuentaPagar] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C05000_Trabajador]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C05000_Trabajador](
	[C05000_DNI] [varchar](8) NOT NULL,
	[C05000_Nombre] [varchar](50) NULL,
	[C05000_Apellido] [varchar](50) NULL,
	[C05000_FechaNacimiento] [date] NULL,
	[C05000_Sexo] [varchar](50) NULL,
	[C05000_Celular1] [varchar](50) NULL,
	[C05000_Celular2] [varchar](50) NULL,
	[C05000_Email1] [varchar](50) NULL,
	[C05000_Email2] [varchar](50) NULL,
	[C05000_TipoSangre] [varchar](10) NULL,
	[C05000_Talla_Zapato] [varchar](5) NULL,
	[C05000_Talla_Pantalon] [varchar](5) NULL,
	[C05000_Talla_Camisa] [varchar](5) NULL,
	[C05000_Observacion] [varchar](100) NULL,
	[C05000_FechaActualizacion] [date] NULL,
	[C05000_ActualizadoPor] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C05000_Trabajador] PRIMARY KEY CLUSTERED 
(
	[C05000_DNI] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C05027_ComportamientoHistorico]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C05027_ComportamientoHistorico](
	[C05027_IdComportamientoHistorico] [int] NOT NULL,
	[C05027_Cargo] [varchar](50) NULL,
	[C05027_Salario] [decimal](18, 0) NULL,
	[C05027_FechaInicio] [date] NULL,
	[C05027_FechaFin] [date] NULL,
	[C05027_NumContrato] [varchar](50) NULL,
	[C05027_Id_RegistroTrabajador] [int] NULL,
 CONSTRAINT [PK_tbl_C05027_ComportamientoHistorico] PRIMARY KEY CLUSTERED 
(
	[C05027_IdComportamientoHistorico] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C05027_RegistroTrabajador]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C05027_RegistroTrabajador](
	[C05027_Id_RegistroTrabajador] [int] NOT NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C05000_DNI] [varchar](8) NULL,
	[C07001_RUC] [varchar](11) NULL,
	[C05027_FechaIngreso] [date] NULL,
	[C05027_FechaCese] [date] NULL,
	[C05027_Estatus] [varchar](10) NULL,
	[C05027_FechaRegistro] [date] NULL,
	[C0527_RegistradoPor] [varchar](50) NULL,
	[C0527_SubGrupo] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C05027_RegistroTrabajador] PRIMARY KEY CLUSTERED 
(
	[C05027_Id_RegistroTrabajador] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C05028_Tareo]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C05028_Tareo](
	[C05028_Id_Tareo] [int] NOT NULL,
	[C05027_Id_RegistroTrabajador] [int] NULL,
	[C05028_Fecha] [date] NULL,
	[C05025_Tareo] [varchar](20) NULL,
	[C05025_CodigoTareo] [varchar](4) NULL,
	[C05025_FechaRegistro] [date] NULL,
	[C05025_RegistradoPor] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C05028_Tareo] PRIMARY KEY CLUSTERED 
(
	[C05028_Id_Tareo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C05032_EDTTareo]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C05032_EDTTareo](
	[C05032_Id_EdtTareo] [int] NOT NULL,
	[A02001_Id_EDT] [int] NULL,
	[C05028_Id_Tareo] [int] NULL,
	[C05032_Horas] [decimal](2, 2) NULL,
 CONSTRAINT [PK_tbl_C05032_EDTTareo] PRIMARY KEY CLUSTERED 
(
	[C05032_Id_EdtTareo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06001_Categoria]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06001_Categoria](
	[C06001_IdCategoria] [varchar](3) NOT NULL,
	[C06001_Categoria] [varchar](50) NULL,
	[C06001_Descripcion] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C06001_Categoria] PRIMARY KEY CLUSTERED 
(
	[C06001_IdCategoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06002_Producto]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06002_Producto](
	[C06002_IdProducto] [varchar](8) NOT NULL,
	[C06001_IdCategoria] [varchar](3) NULL,
	[C06002_Producto] [varchar](80) NULL,
	[C06002_UM] [varchar](10) NULL,
	[C06002_Descripcion] [varchar](50) NULL,
	[C06002_FechaActualizacion] [smalldatetime] NULL,
	[C06002_ActualizadoPor] [varchar](50) NULL,
	[C06002_Etapa] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C06002_Producto] PRIMARY KEY CLUSTERED 
(
	[C06002_IdProducto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06003_SolicitudMaterial]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06003_SolicitudMaterial](
	[C06003_IdSolicitudMaterial] [int] NOT NULL,
	[C06003_Motivo] [varchar](50) NULL,
	[C06003_FechaSolicitud] [date] NULL,
	[C06003_SolicitadoPor] [varchar](100) NULL,
 CONSTRAINT [PK_tbl_C06003_Requerimiento] PRIMARY KEY CLUSTERED 
(
	[C06003_IdSolicitudMaterial] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06004_DetalleSolicitudMaterial]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06004_DetalleSolicitudMaterial](
	[C06004_IdDetalleRequerimiento] [int] NULL,
	[C06003_IdRequerimiento] [nchar](10) NULL,
	[C06002_IdProducto] [varchar](8) NULL,
	[C06004_Producto] [varchar](100) NULL,
	[C06004_Cantidad] [decimal](18, 0) NULL,
	[C06004_UM] [varchar](10) NULL,
	[C06004_FechaRequerida] [date] NULL,
	[C06004_MarcaSugerida] [varchar](50) NULL,
	[C06004_Descripcion] [varchar](50) NULL,
	[C06004_Link] [varchar](50) NULL,
	[C06004_Estatus] [varchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06005_Requerimiento]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06005_Requerimiento](
	[C06005_NumRequerimiento] [int] NULL,
	[C06005_Motivo] [varchar](50) NULL,
	[C06005_FechaRequerimiento] [date] NULL,
	[C06005_SolicitadoPor] [varchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06006_DetalleRequerimiento]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06006_DetalleRequerimiento](
	[C06004_IdDetalleRequerimiento] [int] NULL,
	[C06003_IdRequerimiento] [nchar](10) NULL,
	[C06002_IdProducto] [varchar](8) NULL,
	[C06004_Producto] [varchar](100) NULL,
	[C06004_Cantidad] [decimal](18, 0) NULL,
	[C06004_UM] [varchar](10) NULL,
	[C06004_FechaRequerida] [date] NULL,
	[C06004_MarcaSugerida] [varchar](50) NULL,
	[C06004_Descripcion] [varchar](50) NULL,
	[C06004_Link] [varchar](50) NULL,
	[C06004_Estatus] [varchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06007_Cotizacion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06007_Cotizacion](
	[C06007_IdNumCotizacion] [int] NOT NULL,
 CONSTRAINT [PK_tbl_C06007_Cotizacion] PRIMARY KEY CLUSTERED 
(
	[C06007_IdNumCotizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C06008_CuadroComparativa]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C06008_CuadroComparativa](
	[C06008_IdCuadroComparativo] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C07001_Proveedor]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C07001_Proveedor](
	[C07001_RUC] [varchar](11) NOT NULL,
	[C07001_RazonSocial] [varchar](100) NOT NULL,
	[C07001_Direccion] [varchar](100) NULL,
	[C07001_DniRepresentanteLegal] [varchar](11) NULL,
	[C07001_RepresentanteLegal] [varchar](50) NULL,
	[C07001_ProveedorDe] [varchar](150) NULL,
	[C07001_ListaProductosServicios] [varchar](300) NULL,
	[C07001_Contacto] [varchar](150) NULL,
	[C07001_Correo] [varchar](150) NULL,
	[C07001_Celular] [varchar](50) NULL,
	[C07001_EntidadFinanciera] [varchar](50) NULL,
	[C07001_CuentaCorriente] [varchar](30) NULL,
	[C07001_CCI] [varchar](30) NULL,
	[C07001_CuentaDetraccion] [varchar](30) NULL,
	[C07001_FechaActualizacion] [smalldatetime] NULL,
	[C07001_ActualizadoPor] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C07001_Proveedor] PRIMARY KEY CLUSTERED 
(
	[C07001_RUC] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C07002_CriterioSeleccionEvaluacion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C07002_CriterioSeleccionEvaluacion](
	[C07002_IdCriterio] [int] NOT NULL,
	[C07002_SeleccionEvaluacion] [varchar](50) NULL,
	[C07002_ProveedorDe] [varchar](50) NULL,
	[C07002_Aspecto] [varchar](50) NULL,
	[C07002_AspectoPeso] [decimal](6, 4) NULL,
	[C07002_CriterioSeleccion] [varchar](50) NULL,
	[C07002_CriterioSeleccionPeso] [decimal](6, 4) NULL,
	[C07002_Parametro] [varchar](150) NULL,
	[C07002_Punto] [decimal](6, 4) NULL,
	[C07002_Puntaje] [decimal](6, 4) NULL,
	[C07002_RegistradoPor] [varchar](50) NULL,
	[C07002_FechaRegistro] [smalldatetime] NULL,
 CONSTRAINT [PK_tbl_C07002_CriterioSeleccionEvaluacion] PRIMARY KEY CLUSTERED 
(
	[C07002_IdCriterio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C07003_SeleccionProveedor]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C07003_SeleccionProveedor](
	[C07003_IdSeleccion] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C07004_EvaluacionProveedor]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C07004_EvaluacionProveedor](
	[C07004_IdEvaluacion] [int] IDENTITY(1,1) NOT NULL,
	[C07001_RUC] [varchar](11) NULL,
	[C07004_RazonSocial] [varchar](100) NULL,
	[C07004_Precio] [varchar](100) NULL,
	[C07004_PlazoPago] [varchar](100) NULL,
	[C07004_Calidad] [varchar](100) NULL,
	[C07004_PlazoCumplimiento] [varchar](100) NULL,
	[C07004_Ubicacion] [varchar](100) NULL,
	[C07004_AtencionCliente] [varchar](100) NULL,
	[C07004_SGC] [varchar](100) NULL,
	[C07004_SGSST] [varchar](100) NULL,
	[C07004_SGA] [varchar](100) NULL,
	[C07004_Puntaje] [decimal](6, 4) NULL,
	[C07004_Resultado] [varchar](20) NULL,
	[C07004_Accion] [varchar](100) NULL,
	[C07004_ParametroValor] [varchar](50) NULL,
	[C07004_Observacion] [varchar](200) NULL,
	[C07004_FechaEvaluacion] [smalldatetime] NULL,
	[C07004_EvaluadoPor] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C07004_EvaluacionProveedor] PRIMARY KEY CLUSTERED 
(
	[C07004_IdEvaluacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08001_Equipo]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08001_Equipo](
	[C08001_CodigoEquipo] [varchar](20) NOT NULL,
	[C07001_RucProveedor] [varchar](11) NULL,
	[C07001_RazonSocial] [varchar](100) NULL,
	[C08001_TipoProveedor] [varchar](20) NULL,
	[C08001_Equipo] [varchar](35) NULL,
	[C08001_Placa] [varchar](10) NULL,
	[C08001_DocAcredita] [varchar](30) NULL,
	[C08001_FechaAcredita] [date] NULL,
	[C08001_Marca] [varchar](20) NULL,
	[C08001_Modelo] [varchar](20) NULL,
	[C08001_SerieEquipo] [varchar](20) NULL,
	[C08001_NumChasis] [varchar](20) NULL,
	[C08001_SerieMotor] [varchar](20) NULL,
	[C08001_PotenciaNeta] [varchar](20) NULL,
	[C08001_AñoFabricacion] [varchar](4) NULL,
	[C08001_FechaVencePoliza] [date] NULL,
	[C08001_FechaVenceSOAT] [date] NULL,
	[C08001_FechaVenceCITV] [date] NULL,
	[C08001_CodigoExterno] [varchar](20) NULL,
	[C08001_TipoHoroOdo] [varchar](9) NULL,
	[C08001_HorometroOdometro] [varchar](9) NULL,
	[C08001_TipoCombustible] [varchar](10) NULL,
	[C08001_Estatus] [varchar](15) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
	[C08001_FechaRegistro] [smalldatetime] NULL,
	[C08001_RegistradoPor] [varchar](60) NULL,
	[C08001_FechaActualizacion] [smalldatetime] NULL,
	[C08001_ActualizadoPor] [varchar](60) NULL,
 CONSTRAINT [PK_tlbEquipo] PRIMARY KEY CLUSTERED 
(
	[C08001_CodigoEquipo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08002_AdelantoAmortizacion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08002_AdelantoAmortizacion](
	[C08002_Id_AdelantoAmortizacion] [int] IDENTITY(1,1) NOT NULL,
	[C08002_FechaOperacion] [date] NULL,
	[C08002_TipoOperacion] [varchar](12) NULL,
	[C08002_NumDocumento] [varchar](20) NULL,
	[C08002_Concepto] [varchar](50) NULL,
	[C08002_NumCuota] [varchar](5) NULL,
	[C08002_Monto] [money] NULL,
	[C08001_CodigoEquipo] [varchar](20) NULL,
	[C08004_IdValorizacion] [varchar](22) NULL,
 CONSTRAINT [PK_tbl_C08002_AdelantoAmortizacion_001] PRIMARY KEY CLUSTERED 
(
	[C08002_Id_AdelantoAmortizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08002_AdelantoAmortizacion_002]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08002_AdelantoAmortizacion_002](
	[C08002_Id_AdelantoAmortizacion] [int] IDENTITY(1,1) NOT NULL,
	[C08002_FechaOperacion] [date] NULL,
	[C08002_TipoOperacion] [varchar](12) NULL,
	[C08002_NumDocumento] [varchar](20) NULL,
	[C08002_Concepto] [varchar](50) NULL,
	[C08002_NumCuota] [varchar](5) NULL,
	[C08002_Monto] [money] NULL,
	[C08001_CodigoEquipo] [varchar](20) NULL,
	[C08004_IdValorizacion] [varchar](22) NULL,
 CONSTRAINT [PK_tbl_C08002_AdelantoAmortizacion] PRIMARY KEY CLUSTERED 
(
	[C08002_Id_AdelantoAmortizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08003_ContratoAdenda]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08003_ContratoAdenda](
	[C08003_IdContratoAdenda] [varchar](23) NOT NULL,
	[C08003_TipoDocumento] [varchar](8) NULL,
	[C08003_NumContrato] [varchar](19) NULL,
	[C08001_CodigoEquipo] [varchar](20) NULL,
	[C08003_FechaInicio] [date] NULL,
	[C08003_FechaFin] [date] NULL,
	[C08003_Plazo] [varchar](25) NULL,
	[C08003_Modalidad] [varchar](30) NULL,
	[C08003_TipoTarifa] [varchar](3) NULL,
	[C08003_Tarifa] [money] NULL,
	[C08003_Moneda] [varchar](20) NULL,
	[C08003_MinimoPor] [varchar](20) NULL,
	[C08003_CantidadMinima] [decimal](6, 2) NULL,
	[C08003_Estatus] [varchar](20) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
 CONSTRAINT [PK_tbl_C08003_ContratoAdenda] PRIMARY KEY CLUSTERED 
(
	[C08003_IdContratoAdenda] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08004_ValorizacionEquipo]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08004_ValorizacionEquipo](
	[C08004_IdValorizacion] [varchar](22) NOT NULL,
	[C08004_NumValorizacion] [varchar](3) NULL,
	[C08003_IdContratoAdenda] [varchar](23) NULL,
	[C08004_FechaInicio] [date] NULL,
	[C08004_FechaFin] [date] NULL,
	[C08004_TipoCambio] [money] NULL,
	[C08004_Cantidad] [decimal](8, 4) NULL,
	[C08004_UnidadMedida] [varchar](10) NULL,
	[C08004_PU_Valorizacion] [money] NULL,
	[C08004_ValorizacionBruta] [money] NULL,
	[C08004_CantidadCombustible] [decimal](8, 4) NULL,
	[C08004_PrecioCombustible] [money] NULL,
	[C08004_ImporteCombustible] [money] NULL,
	[C08004_PrecioManipuleoCombustible] [money] NULL,
	[C08004_ImporteManipuleoCombustible] [money] NULL,
	[C08004_ImporteAdelanto] [money] NULL,
	[C08004_ImporteGastoObra] [money] NULL,
	[C08004_ImporteExcesoCombustible] [money] NULL,
	[C08004_DescuenteTotal] [money] NULL,
	[C08004_ValorizacionNeta] [money] NULL,
	[C08004_Estatus] [varchar](20) NULL,
 CONSTRAINT [PK_tbl_C08004_ValorizacionEquipo] PRIMARY KEY CLUSTERED 
(
	[C08004_IdValorizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08005_ParteDiario]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08005_ParteDiario](
	[C08005_IdParteDiario] [varchar](20) NOT NULL,
	[C08005_NumParteDiario] [int] NOT NULL,
	[C08005_Fecha] [date] NULL,
	[C08005_DNI_Operador] [varchar](8) NULL,
	[C08005_Operador] [varchar](50) NULL,
	[C08005_Turno] [varchar](1) NULL,
	[C08005_HorometroOdometro] [varchar](9) NULL,
	[C08005_Inicial] [decimal](10, 2) NULL,
	[C08005_Final] [decimal](10, 2) NULL,
	[C08005_Diferencia] [decimal](10, 2) NULL,
	[C08005_DescuentoPorCalentamiento] [decimal](6, 4) NULL,
	[C08005_OtrosDescuentos] [decimal](6, 4) NULL,
	[C08005_CantidadEfectiva] [decimal](6, 4) NULL,
	[C08005_DescuentoCantidadMinima] [decimal](6, 4) NULL,
	[C08005_CantidadMinima] [decimal](6, 4) NULL,
	[C08005_Actividad] [varchar](250) NULL,
	[C08005_EDT] [varchar](350) NULL,
	[C08004_IdValorizacion] [varchar](22) NULL,
 CONSTRAINT [PK_tbl_C08005_ParteDiario_1] PRIMARY KEY CLUSTERED 
(
	[C08005_IdParteDiario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08006_EquipoEDT]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08006_EquipoEDT](
	[C08005_IdParteDiario] [varchar](20) NOT NULL,
	[C08006_IdEquipoEDT] [int] IDENTITY(1,1) NOT NULL,
	[C08006_Porcentaje] [decimal](3, 0) NULL,
	[A02001_Id_EDT] [int] NULL,
	[C08006_EDT] [varchar](250) NULL,
	[C08006_Actividad] [varchar](250) NULL,
 CONSTRAINT [PK_tbl_C08006_EquipoEDT_1] PRIMARY KEY CLUSTERED 
(
	[C08006_IdEquipoEDT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08007_EquipoCombustible]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08007_EquipoCombustible](
	[C08004_IdValorizacion] [varchar](22) NULL,
	[C08007_IdValeSalida] [varchar](20) NOT NULL,
	[C08007_NumValeSalida] [int] NULL,
	[C08007_Fecha] [date] NULL,
	[C08007_HorometroOdometro] [varchar](9) NULL,
	[C08007_Inicial] [decimal](10, 2) NULL,
	[C08007_Cantidad] [decimal](10, 4) NULL,
	[C08007_PrecioUnitarioSinIGV] [smallmoney] NULL,
	[C08007_Importe] [smallmoney] NULL,
	[C08007_Comentario] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_EquipoCombustible] PRIMARY KEY CLUSTERED 
(
	[C08007_IdValeSalida] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08008_EquipoGastoObra]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08008_EquipoGastoObra](
	[C08004_IdValorizacion] [varchar](22) NULL,
	[C08008_IdGastoObra] [int] IDENTITY(1,1) NOT NULL,
	[C08008_FechaOperacion] [date] NULL,
	[C08008_Proveedor] [varchar](100) NULL,
	[C08008_Concepto] [varchar](150) NULL,
	[C08008_TipoDocumento] [varchar](20) NULL,
	[C08008_NumDocumento] [varchar](20) NULL,
	[C08008_Importe] [smallmoney] NULL,
	[C08008_IncluyeIGV] [varchar](2) NULL,
	[C08008_ImporteSinIGV] [smallmoney] NULL,
 CONSTRAINT [PK_tbl_C08008_EquipoGastoObra] PRIMARY KEY CLUSTERED 
(
	[C08008_IdGastoObra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08009_TipoEquipo]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08009_TipoEquipo](
	[C08009_IdTipoEquipo] [varchar](2) NOT NULL,
	[C08009_TipoEquipo] [varchar](50) NULL,
	[C08009_IdCategoria] [varchar](2) NULL,
	[C08009_Categoria] [varchar](20) NULL,
	[C08009_Codificacion] [varchar](5) NULL,
 CONSTRAINT [PK_tbl_C08009_TipoEquipo] PRIMARY KEY CLUSTERED 
(
	[C08009_IdTipoEquipo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C08010_ExcesoCombustible]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C08010_ExcesoCombustible](
	[C08010_IdExcesoCombustible] [int] IDENTITY(1,1) NOT NULL,
	[C08004_IdValorizacion] [varchar](22) NULL,
	[C08010_ConsumoCombustible] [money] NULL,
	[C08010_TipoHoroOdo] [varchar](10) NULL,
	[C08010_Inicio] [money] NULL,
	[C08010_Final] [money] NULL,
	[C08010_Total] [money] NULL,
	[C08010_Rendimiento] [money] NULL,
	[C08010_RatioControl] [money] NULL,
	[C08010_Diferencia] [money] NULL,
	[C08010_ExcesoCombustible] [money] NULL,
	[C08010_PrecioUnitario] [money] NULL,
	[C08010_ImporteExcesoCombustible] [money] NULL,
 CONSTRAINT [PK_tbl_C08010_ExcesoCombustible] PRIMARY KEY CLUSTERED 
(
	[C08010_IdExcesoCombustible] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C10001_CajaChica]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C10001_CajaChica](
	[C10001_NumCaja] [varchar](10) NOT NULL,
	[C10001_SaldoInicial] [money] NULL,
	[C10001_IngresoTotal] [money] NULL,
	[C10001_SalidaTotal] [money] NULL,
	[C10001_SaldoFinal] [money] NULL,
	[C10001_FechaApertura] [date] NULL,
	[C10001_FechaCierre] [date] NULL,
	[C10001_Estatus] [varchar](20) NULL,
 CONSTRAINT [PK_tbl_C10001_CajaChica] PRIMARY KEY CLUSTERED 
(
	[C10001_NumCaja] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C10001_MovimentoCaja]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C10001_MovimentoCaja](
	[C10001_NumMovimiento] [int] IDENTITY(1,1) NOT NULL,
	[C10001_FechaMovimiento] [datetime] NULL,
	[C10001_NumCaja] [varchar](10) NULL,
	[C10001_Rubro] [varchar](50) NULL,
	[C10001_Fecha] [date] NULL,
	[C10001_RUC] [varchar](11) NULL,
	[C10001_RazonSocial] [varchar](50) NULL,
	[C10001_TipoDocumento] [varchar](50) NULL,
	[C10001_SerieDocumento] [varchar](10) NULL,
	[C10001_NumDocumento] [varchar](10) NULL,
	[C10001_Detalle] [varchar](100) NULL,
	[C10001_Monto] [money] NULL,
	[C10001_EntradaSalida] [varchar](15) NULL,
	[C10001_NumSolicitud] [int] NULL,
	[C10001_RegistradoPor] [varchar](100) NULL,
	[C10001_FechaRegistro] [datetime] NULL,
	[C10001_AprobadoPor] [varchar](50) NULL,
 CONSTRAINT [PK_tbl_C10001_MovimentoCaja] PRIMARY KEY CLUSTERED 
(
	[C10001_NumMovimiento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_C10001_SolicitudCaja]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_C10001_SolicitudCaja](
	[C10001_NumSolicitud] [int] IDENTITY(1,1) NOT NULL,
	[C10001_FechaSolicitud] [datetime] NULL,
	[DNI_Usuario] [varchar](8) NULL,
	[Nombre] [varchar](50) NULL,
	[C10001_Motivo] [varchar](100) NULL,
	[C10001_MontoSolicitado] [money] NULL,
	[C10001_MontoRendido] [money] NULL,
	[C10001_MontoDevueltoReembolsado] [money] NULL,
	[C10001_Estatus] [varchar](15) NULL,
 CONSTRAINT [PK_tbl_C10001_SolicitudCaja] PRIMARY KEY CLUSTERED 
(
	[C10001_NumSolicitud] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00001_UnidadOperativa]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00001_UnidadOperativa](
	[G00001_Id_UnidadOperativa] [varchar](7) NOT NULL,
	[G00001_CodigoUnidadOperativa] [varchar](10) NULL,
	[G00001_UnidadOperativa] [varchar](50) NULL,
	[G00001_Proyecto] [varchar](200) NULL,
 CONSTRAINT [PK_tbl_000_UnidadOperativa] PRIMARY KEY CLUSTERED 
(
	[G00001_Id_UnidadOperativa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00003_UsuarioRolUnidadOperativa]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa](
	[G00003_Id_UsuarioRolUnidadOperativa] [int] IDENTITY(1,1) NOT NULL,
	[G00002_DNI] [varchar](8) NOT NULL,
	[G00004_Id_Rol] [int] NOT NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NOT NULL,
 CONSTRAINT [PK_tbl_G00003_UsuarioRolUnidadOperativa] PRIMARY KEY CLUSTERED 
(
	[G00003_Id_UsuarioRolUnidadOperativa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_G00007_ComponenteUnidadOperativa]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_G00007_ComponenteUnidadOperativa](
	[G00007_Id_Componente] [varchar](15) NOT NULL,
	[G00007_Componente] [varchar](50) NULL,
	[G00007_CodComponente] [varchar](7) NULL,
	[G00001_Id_UnidadOperativa] [varchar](7) NULL,
 CONSTRAINT [PK_tbl_G00007_ComponenteUnidadOperativa] PRIMARY KEY CLUSTERED 
(
	[G00007_Id_Componente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_SUNAT01_TipoMedioPago]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_SUNAT01_TipoMedioPago](
	[SUNAT01_Id_Pago] [varchar](10) NOT NULL,
	[SUNAT01_TipoMedioPago] [varchar](100) NULL,
	[SUNAT01_MedioPago] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_SUNAT01_TipoMedioPago] PRIMARY KEY CLUSTERED 
(
	[SUNAT01_Id_Pago] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_SUNAT06_UnidadMedida]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_SUNAT06_UnidadMedida](
	[SUNAT06_Id_UM] [varchar](10) NULL,
	[SUNAT06_UnidadMedida] [varchar](50) NULL,
	[SUNAT06_UM] [varchar](10) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_SUNAT10_TipoComprobante]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_SUNAT10_TipoComprobante](
	[SUNAT10_CodigoTipoComprobante] [varchar](10) NOT NULL,
	[SUNAT10_TipoComprobante] [varchar](50) NULL,
	[SUNAT10_Comprobante] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_SUNAT10_TipoComprobante] PRIMARY KEY CLUSTERED 
(
	[SUNAT10_CodigoTipoComprobante] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_SUNAT12_TipoOperacion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_SUNAT12_TipoOperacion](
	[SUNAT12_TipoOperacion] [varchar](50) NOT NULL,
	[SUNAT12_Cod_Operacion] [varchar](10) NULL,
	[SUNAT12_IngresoSalida] [varchar](7) NULL,
	[SUNAT12_DocInterno] [varchar](20) NULL,
	[SUNAT12_ClienteProveedor] [varchar](10) NULL,
 CONSTRAINT [PK_tbl_030_12TipoOperacion] PRIMARY KEY CLUSTERED 
(
	[SUNAT12_TipoOperacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tbl_A02001_EDT]  WITH CHECK ADD  CONSTRAINT [FK_tbl_A02001_EDT_tbl_G00001_UnidadOperativa] FOREIGN KEY([G00001_Id_UnidadOperativa])
REFERENCES [dbo].[tbl_G00001_UnidadOperativa] ([G00001_Id_UnidadOperativa])
GO
ALTER TABLE [dbo].[tbl_A02001_EDT] CHECK CONSTRAINT [FK_tbl_A02001_EDT_tbl_G00001_UnidadOperativa]
GO
ALTER TABLE [dbo].[tbl_C020911_SeguimientoInspeccion]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C020911_SeguimientoInspeccion_tbl_C02091_SeguimientoInspeccionSSOMA] FOREIGN KEY([C02091_NumRegistro])
REFERENCES [dbo].[tbl_C02091_SeguimientoInspeccionSSOMA] ([C02091_NumRegistro])
GO
ALTER TABLE [dbo].[tbl_C020911_SeguimientoInspeccion] CHECK CONSTRAINT [FK_tbl_C020911_SeguimientoInspeccion_tbl_C02091_SeguimientoInspeccionSSOMA]
GO
ALTER TABLE [dbo].[tbl_C04003_AdminCentroCosto]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04003_AdminCentroCosto_tbl_C04001_CentroCosto] FOREIGN KEY([C04001_CodCentroCosto])
REFERENCES [dbo].[tbl_C04001_CentroCosto] ([C04001_CodPartida])
GO
ALTER TABLE [dbo].[tbl_C04003_AdminCentroCosto] CHECK CONSTRAINT [FK_tbl_C04003_AdminCentroCosto_tbl_C04001_CentroCosto]
GO
ALTER TABLE [dbo].[tbl_C04003_AdminCentroCosto]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04003_AdminCentroCosto_tbl_C04002_CuentasPorPagar] FOREIGN KEY([C04002_IdCuentaPagar])
REFERENCES [dbo].[tbl_C04002_CuentasPorPagar] ([C04002_IdCuentaPagar])
GO
ALTER TABLE [dbo].[tbl_C04003_AdminCentroCosto] CHECK CONSTRAINT [FK_tbl_C04003_AdminCentroCosto_tbl_C04002_CuentasPorPagar]
GO
ALTER TABLE [dbo].[tbl_C04005_DetalleProgramacionPago]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04005_DetalleProgramacionPago_tbl_C04002_CuentasPorPagar] FOREIGN KEY([C04002_IdCuentaPagar])
REFERENCES [dbo].[tbl_C04002_CuentasPorPagar] ([C04002_IdCuentaPagar])
GO
ALTER TABLE [dbo].[tbl_C04005_DetalleProgramacionPago] CHECK CONSTRAINT [FK_tbl_C04005_DetalleProgramacionPago_tbl_C04002_CuentasPorPagar]
GO
ALTER TABLE [dbo].[tbl_C04005_DetalleProgramacionPago]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04005_DetalleProgramacionPago_tbl_C04004_ProgramacionPago] FOREIGN KEY([C04004_NumProgramacion])
REFERENCES [dbo].[tbl_C04004_ProgramacionPago] ([C04004_NumProgramacion])
GO
ALTER TABLE [dbo].[tbl_C04005_DetalleProgramacionPago] CHECK CONSTRAINT [FK_tbl_C04005_DetalleProgramacionPago_tbl_C04004_ProgramacionPago]
GO
ALTER TABLE [dbo].[tbl_C04008_DetalleMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04008_DetalleMovimiento_tbl_C04002_CuentasPorPagar] FOREIGN KEY([C04002_IdCuentaPagar])
REFERENCES [dbo].[tbl_C04002_CuentasPorPagar] ([C04002_IdCuentaPagar])
GO
ALTER TABLE [dbo].[tbl_C04008_DetalleMovimiento] CHECK CONSTRAINT [FK_tbl_C04008_DetalleMovimiento_tbl_C04002_CuentasPorPagar]
GO
ALTER TABLE [dbo].[tbl_C04008_DetalleMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C04008_DetalleMovimiento_tbl_C04007_FlujoCajaBanco] FOREIGN KEY([C04007_IdMovim])
REFERENCES [dbo].[tbl_C04007_FlujoCajaBanco] ([C04007_IdMovim])
GO
ALTER TABLE [dbo].[tbl_C04008_DetalleMovimiento] CHECK CONSTRAINT [FK_tbl_C04008_DetalleMovimiento_tbl_C04007_FlujoCajaBanco]
GO
ALTER TABLE [dbo].[tbl_C05027_ComportamientoHistorico]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05027_ComportamientoHistorico_tbl_C05027_RegistroTrabajador] FOREIGN KEY([C05027_Id_RegistroTrabajador])
REFERENCES [dbo].[tbl_C05027_RegistroTrabajador] ([C05027_Id_RegistroTrabajador])
GO
ALTER TABLE [dbo].[tbl_C05027_ComportamientoHistorico] CHECK CONSTRAINT [FK_tbl_C05027_ComportamientoHistorico_tbl_C05027_RegistroTrabajador]
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_C05000_Trabajador] FOREIGN KEY([C05000_DNI])
REFERENCES [dbo].[tbl_C05000_Trabajador] ([C05000_DNI])
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador] CHECK CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_C05000_Trabajador]
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_C07001_Proveedor] FOREIGN KEY([C07001_RUC])
REFERENCES [dbo].[tbl_C07001_Proveedor] ([C07001_RUC])
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador] CHECK CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_C07001_Proveedor]
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_G00001_UnidadOperativa] FOREIGN KEY([G00001_Id_UnidadOperativa])
REFERENCES [dbo].[tbl_G00001_UnidadOperativa] ([G00001_Id_UnidadOperativa])
GO
ALTER TABLE [dbo].[tbl_C05027_RegistroTrabajador] CHECK CONSTRAINT [FK_tbl_C05027_RegistroTrabajador_tbl_G00001_UnidadOperativa]
GO
ALTER TABLE [dbo].[tbl_C05028_Tareo]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05028_Tareo_tbl_C05027_RegistroTrabajador] FOREIGN KEY([C05027_Id_RegistroTrabajador])
REFERENCES [dbo].[tbl_C05027_RegistroTrabajador] ([C05027_Id_RegistroTrabajador])
GO
ALTER TABLE [dbo].[tbl_C05028_Tareo] CHECK CONSTRAINT [FK_tbl_C05028_Tareo_tbl_C05027_RegistroTrabajador]
GO
ALTER TABLE [dbo].[tbl_C05032_EDTTareo]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05032_EDTTareo_tbl_A02001_EDT] FOREIGN KEY([A02001_Id_EDT])
REFERENCES [dbo].[tbl_A02001_EDT] ([A02001_Id_EDT])
GO
ALTER TABLE [dbo].[tbl_C05032_EDTTareo] CHECK CONSTRAINT [FK_tbl_C05032_EDTTareo_tbl_A02001_EDT]
GO
ALTER TABLE [dbo].[tbl_C05032_EDTTareo]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C05032_EDTTareo_tbl_C05028_Tareo] FOREIGN KEY([C05028_Id_Tareo])
REFERENCES [dbo].[tbl_C05028_Tareo] ([C05028_Id_Tareo])
GO
ALTER TABLE [dbo].[tbl_C05032_EDTTareo] CHECK CONSTRAINT [FK_tbl_C05032_EDTTareo_tbl_C05028_Tareo]
GO
ALTER TABLE [dbo].[tbl_C06011_DetalleMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C06011_DetalleMovimiento_tbl_C06010_Movimiento] FOREIGN KEY([C06010_NumRegistro])
REFERENCES [dbo].[tbl_C06010_Movimiento] ([C06010_NumRegistro])
GO
ALTER TABLE [dbo].[tbl_C06011_DetalleMovimiento] CHECK CONSTRAINT [FK_tbl_C06011_DetalleMovimiento_tbl_C06010_Movimiento]
GO
ALTER TABLE [dbo].[tbl_C08001_Equipo]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08001_Equipo_tbl_C07001_Proveedor] FOREIGN KEY([C07001_RucProveedor])
REFERENCES [dbo].[tbl_C07001_Proveedor] ([C07001_RUC])
GO
ALTER TABLE [dbo].[tbl_C08001_Equipo] CHECK CONSTRAINT [FK_tbl_C08001_Equipo_tbl_C07001_Proveedor]
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_001_tbl_C08001_Equipo] FOREIGN KEY([C08001_CodigoEquipo])
REFERENCES [dbo].[tbl_C08001_Equipo] ([C08001_CodigoEquipo])
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion] CHECK CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_001_tbl_C08001_Equipo]
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_001_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion] CHECK CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_001_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion_002]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_tbl_C08001_Equipo] FOREIGN KEY([C08001_CodigoEquipo])
REFERENCES [dbo].[tbl_C08001_Equipo] ([C08001_CodigoEquipo])
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion_002] CHECK CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_tbl_C08001_Equipo]
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion_002]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08002_AdelantoAmortizacion_002] CHECK CONSTRAINT [FK_tbl_C08002_AdelantoAmortizacion_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_C08003_ContratoAdenda]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08003_ContratoAdenda_tbl_C08001_Equipo] FOREIGN KEY([C08001_CodigoEquipo])
REFERENCES [dbo].[tbl_C08001_Equipo] ([C08001_CodigoEquipo])
GO
ALTER TABLE [dbo].[tbl_C08003_ContratoAdenda] CHECK CONSTRAINT [FK_tbl_C08003_ContratoAdenda_tbl_C08001_Equipo]
GO
ALTER TABLE [dbo].[tbl_C08004_ValorizacionEquipo]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08004_ValorizacionEquipo_tbl_C08003_ContratoAdenda] FOREIGN KEY([C08003_IdContratoAdenda])
REFERENCES [dbo].[tbl_C08003_ContratoAdenda] ([C08003_IdContratoAdenda])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08004_ValorizacionEquipo] CHECK CONSTRAINT [FK_tbl_C08004_ValorizacionEquipo_tbl_C08003_ContratoAdenda]
GO
ALTER TABLE [dbo].[tbl_C08005_ParteDiario]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08005_ParteDiario_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08005_ParteDiario] CHECK CONSTRAINT [FK_tbl_C08005_ParteDiario_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_C08006_EquipoEDT]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08006_EquipoEDT_tbl_A02001_EDT] FOREIGN KEY([A02001_Id_EDT])
REFERENCES [dbo].[tbl_A02001_EDT] ([A02001_Id_EDT])
GO
ALTER TABLE [dbo].[tbl_C08006_EquipoEDT] CHECK CONSTRAINT [FK_tbl_C08006_EquipoEDT_tbl_A02001_EDT]
GO
ALTER TABLE [dbo].[tbl_C08006_EquipoEDT]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08006_EquipoEDT_tbl_C08005_ParteDiario] FOREIGN KEY([C08005_IdParteDiario])
REFERENCES [dbo].[tbl_C08005_ParteDiario] ([C08005_IdParteDiario])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08006_EquipoEDT] CHECK CONSTRAINT [FK_tbl_C08006_EquipoEDT_tbl_C08005_ParteDiario]
GO
ALTER TABLE [dbo].[tbl_C08007_EquipoCombustible]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08007_EquipoCombustible_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08007_EquipoCombustible] CHECK CONSTRAINT [FK_tbl_C08007_EquipoCombustible_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_C08008_EquipoGastoObra]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08008_EquipoGastoObra_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08008_EquipoGastoObra] CHECK CONSTRAINT [FK_tbl_C08008_EquipoGastoObra_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_C08010_ExcesoCombustible]  WITH CHECK ADD  CONSTRAINT [FK_tbl_C08010_ExcesoCombustible_tbl_C08004_ValorizacionEquipo] FOREIGN KEY([C08004_IdValorizacion])
REFERENCES [dbo].[tbl_C08004_ValorizacionEquipo] ([C08004_IdValorizacion])
ON UPDATE CASCADE
GO
ALTER TABLE [dbo].[tbl_C08010_ExcesoCombustible] CHECK CONSTRAINT [FK_tbl_C08010_ExcesoCombustible_tbl_C08004_ValorizacionEquipo]
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRol]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00003_UsuarioRol_tbl_G00002_Usuario1] FOREIGN KEY([G00002_DNI])
REFERENCES [dbo].[tbl_G00002_Usuario] ([G00002_DNI])
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRol] CHECK CONSTRAINT [FK_tbl_G00003_UsuarioRol_tbl_G00002_Usuario1]
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRol]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00003_UsuarioRol_tbl_G00004_Rol] FOREIGN KEY([G00004_Id_Rol])
REFERENCES [dbo].[tbl_G00004_Rol] ([G00004_Id_Rol])
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRol] CHECK CONSTRAINT [FK_tbl_G00003_UsuarioRol_tbl_G00004_Rol]
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00001_UnidadOperativa] FOREIGN KEY([G00001_Id_UnidadOperativa])
REFERENCES [dbo].[tbl_G00001_UnidadOperativa] ([G00001_Id_UnidadOperativa])
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] CHECK CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00001_UnidadOperativa]
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00002_Usuario] FOREIGN KEY([G00002_DNI])
REFERENCES [dbo].[tbl_G00002_Usuario] ([G00002_DNI])
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] CHECK CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00002_Usuario]
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00004_Rol] FOREIGN KEY([G00004_Id_Rol])
REFERENCES [dbo].[tbl_G00004_Rol] ([G00004_Id_Rol])
GO
ALTER TABLE [dbo].[tbl_G00003_UsuarioRolUnidadOperativa] CHECK CONSTRAINT [FK_tbl_G00003_UsuarioRolUnidadOperativa_tbl_G00004_Rol]
GO
ALTER TABLE [dbo].[tbl_G00005_RolPermiso]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00005_RolPermiso_tbl_G00004_Rol] FOREIGN KEY([G00004_Id_Rol])
REFERENCES [dbo].[tbl_G00004_Rol] ([G00004_Id_Rol])
GO
ALTER TABLE [dbo].[tbl_G00005_RolPermiso] CHECK CONSTRAINT [FK_tbl_G00005_RolPermiso_tbl_G00004_Rol]
GO
ALTER TABLE [dbo].[tbl_G00005_RolPermiso]  WITH CHECK ADD  CONSTRAINT [FK_tbl_G00005_RolPermiso_tbl_G00006_Permiso] FOREIGN KEY([G00006_Id_Permiso])
REFERENCES [dbo].[tbl_G00006_Permiso] ([G00006_Id_Permiso])
GO
ALTER TABLE [dbo].[tbl_G00005_RolPermiso] CHECK CONSTRAINT [FK_tbl_G00005_RolPermiso_tbl_G00006_Permiso]
GO
/****** Object:  StoredProcedure [dbo].[SP_304_R01_RegistroCuentaPagar]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- AUTOR: Josué Carhuaricra Alania
-- FECHA: 05.ENE.2022
-- NOMBRE: Rpt_01 Cuentas por Pagar Registrados en el mes V01
-- DESCRIPCIÓN: 
--
--
-- =============================================
CREATE PROCEDURE [dbo].[SP_304_R01_RegistroCuentaPagar]
@FechaInicio as date,
@FechaFin as date
AS
BEGIN
 --01
SELECT        C04002_IdCuentaPagar, C04002_DNI_RUC, C04002_RazonSocial, C04002_FechaEmision, C04002_Comprobante, C04002_Serie, C04002_Numero, C04002_Concepto, C04002_Moneda, C04002_MontoSinIGV, C04002_MontoIGV, 
                         C04002_MontoConIGV, C04002_PorceDetraccion, C04002_MontoDetraccion, C04002_MontoRetencion, C04002_MontoFinal, C04002_FechaRegistro
FROM            dbo.tbl_C04002_CuentasPorPagar
WHERE        C04002_FechaRegistro BETWEEN @FechaInicio AND @FechaFin

END
GO
/****** Object:  StoredProcedure [dbo].[SP_304_R02_Detraccion]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- AUTOR: Josué Carhuaricra Alania
-- FECHA: 05.ENE.2022
-- NOMBRE: Rpt_02 Detracción V01
-- DESCRIPCIÓN: 
--
-- =============================================
CREATE PROCEDURE [dbo].[SP_304_R02_Detraccion]

AS
BEGIN

SELECT        C04002_IdCuentaPagar, C04002_DNI_RUC, C04002_RazonSocial, C04002_FechaEmision, C04002_Comprobante, C04002_Serie, C04002_Numero, C04002_Concepto, C04002_Moneda, C04002_MontoSinIGV, C04002_MontoIGV, 
                         C04002_MontoConIGV, C04002_PorceDetraccion, C04002_MontoDetraccion, C04002_MontoRetencion, C04002_MontoFinal, C04002_FechaRegistro
FROM            dbo.tbl_C04002_CuentasPorPagar

END
GO
/****** Object:  StoredProcedure [dbo].[SP_AAA]    Script Date: 4/07/2025 22:01:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      <Author, , Name>
-- Create Date: <Create Date, , >
-- Description: <Description, , >
-- =============================================
CREATE PROCEDURE [dbo].[SP_AAA]

AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
 --01
SELECT        C04002_IdCuentaPagar, C04002_DNI_RUC, C04002_RazonSocial, C04002_FechaEmision, C04002_Comprobante, C04002_Serie, C04002_Numero, C04002_Concepto, C04002_Moneda, C04002_MontoSinIGV, C04002_MontoIGV, 
                         C04002_MontoConIGV, C04002_PorceDetraccion, C04002_MontoDetraccion, C04002_MontoRetencion, C04002_MontoFinal, C04002_FechaRegistro
FROM            dbo.tbl_C04002_CuentasPorPagar

END
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "tbl_C06010_Movimiento (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 289
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tbl_C06011_DetalleMovimiento (dbo)"
            Begin Extent = 
               Top = 6
               Left = 327
               Bottom = 278
               Right = 811
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 41
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Tab' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_306_MovimientoAlmacen'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane2', @value=N'le = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_306_MovimientoAlmacen'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=2 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_306_MovimientoAlmacen'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "tbl_G00002_Usuario (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 274
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tbl_G00003_UsuarioRol (dbo)"
            Begin Extent = 
               Top = 185
               Left = 309
               Bottom = 298
               Right = 517
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tbl_G00004_Rol (dbo)"
            Begin Extent = 
               Top = 3
               Left = 500
               Bottom = 122
               Right = 708
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tbl_G00005_RolPermiso (dbo)"
            Begin Extent = 
               Top = 197
               Left = 722
               Bottom = 310
               Right = 930
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tbl_G00006_Permiso (dbo)"
            Begin Extent = 
               Top = 0
               Left = 960
               Bottom = 160
               Right = 1168
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = ' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_UsuarioRolPermiso'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane2', @value=N'
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_UsuarioRolPermiso'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=2 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vst_UsuarioRolPermiso'
GO
USE [master]
GO
ALTER DATABASE [dbBitCorp] SET  READ_WRITE 
GO
