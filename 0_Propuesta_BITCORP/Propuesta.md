# Estructura de carpeta

1. **✅ Estructura central de la carpeta BITCORP 📂 **
   - 
 BITCORP/
 ├── runtime-python/ #Contiene el intérprete de Python y las bibliotecas necesarias para ejecutar BitCorp
 ├── external_libs/
 │  ├── node/
 │  └── ...
 ├──deploy/
 │  ├── docker/
 │  ├── Dockerfile
 │  ├──  docker-compose.yml
 │  ├──  .env
 ├── kubernetes/
 │   ├── init-scripts/
 │   ├── README.md    
 ├── bitcorp/
 │   ├── apps-web/
 │   │    ├── app-1
 │   │    │   ├── backend/
 │   │    │   ├── frontend/ 
 │   │    │   ├── docs/
 │   │    │   ├── __init__.py
 │   │    │   └── ...
 │   │    ├── app-n
 │   │    │   ├── backend/
 │   │    │   ├── frontend/ 
 │   │    │   ├── docs/
 │   │    │   ├── __init__.py
 │   │    │   └── ...
 │   │    └── ...
 │   ├── apps-movil/
 │   ├── backend-framework-core/  #core framework, controladores, ORM
 │   ├── doc/
 │   │    ├── architecture.md
 │   │    ├── how-to-deploy.md
 │   │    ├──dev-guide/
 │   │    │   ├──apps.md
 │   │    │   ├──backend-core.md
 │   │    ├──system-diagrams/
 │   │    │  ├──ERD.svg
 │   │    │  ├──flowcharts/
 │   │    └── index.md
 │   ├── config/
 │   │   ├── dev.conf
 │   │   ├── prod.conf
 │   │   └── test.conf
 │   ├── bitcorp-bin
 │   ├── requirements.txt
 │   ├── MANIFEST.in
 │   ├── SECURITY
 │   ├── README.md   
 │   ├── LICENSE
 │   ├── 
 │   └── ...

