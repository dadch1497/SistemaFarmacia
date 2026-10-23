<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Parámetros de Conexión a SUNAT
    |--------------------------------------------------------------------------
    | En entorno BETA se utiliza el RUC 20000000001 con usuario MODDATOS y clave moddatos.
    | Para pase a producción real, configurar las variables de entorno:
    | SUNAT_RUC, SUNAT_USUARIO_SOL, SUNAT_CLAVE_SOL, SUNAT_ENV (BETA|PRODUCCION)
    */
    'ruc'         => getenv('SUNAT_RUC') ?: '20000000001',
    'usuario_sol' => getenv('SUNAT_USUARIO_SOL') ?: 'MODDATOS',
    'clave_sol'   => getenv('SUNAT_CLAVE_SOL') ?: 'moddatos',
    'ambiente'    => getenv('SUNAT_ENV') ?: 'BETA', // 'BETA' o 'PRODUCCION'

    /*
    |--------------------------------------------------------------------------
    | Certificado Digital
    |--------------------------------------------------------------------------
    | Ruta del certificado digital tributario (.pem)
    */
    'cert_path'   => getenv('SUNAT_CERT_PATH') ?: __DIR__ . '/../certs/certificate.pem',

    /*
    |--------------------------------------------------------------------------
    | Datos Oficiales de la Farmacia (Emisor)
    |--------------------------------------------------------------------------
    */
    'empresa' => [
        'ruc'          => getenv('SUNAT_RUC') ?: '20000000001',
        'razon_social' => getenv('EMPRESA_RAZON_SOCIAL') ?: 'FARMACIA FARMAGEST S.A.C.',
        'nombre_comercial' => getenv('EMPRESA_NOMBRE_COMERCIAL') ?: 'FARMAGEST',
        'direccion'    => [
            'ubigeo'       => '150101',
            'departamento' => 'LIMA',
            'provincia'    => 'LIMA',
            'distrito'     => 'LIMA',
            'urbanizacion' => '-',
            'direccion'    => 'AV. PRINCIPAL 123 - FARMACIA'
        ]
    ]
];
