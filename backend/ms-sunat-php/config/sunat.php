<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Parámetros de Conexión a SUNAT
    |--------------------------------------------------------------------------
    */
    'ruc'         => getenv('SUNAT_RUC') ?: '10734577583',
    'usuario_sol' => getenv('SUNAT_USUARIO_SOL') ?: '73457758',
    'clave_sol'   => getenv('SUNAT_CLAVE_SOL') ?: 'Altamirano10',
    'ambiente'    => getenv('SUNAT_ENV') ?: 'PRODUCCION',

    /*
    |--------------------------------------------------------------------------
    | Credenciales API REST - SUNAT SIRE (OAuth 2.0)
    |--------------------------------------------------------------------------
    */
    'sire' => [
        'client_id'     => getenv('SUNAT_SIRE_CLIENT_ID') ?: '3072e412-5d14-4806-8072-fb3423f378dc',
        'client_secret' => getenv('SUNAT_SIRE_CLIENT_SECRET') ?: 'ngZWg2sk8WHlOmy8erDTgw==',
    ],

    /*
    |--------------------------------------------------------------------------
    | Certificado Digital (para firma de Comprobantes XML)
    |--------------------------------------------------------------------------
    */
    'cert_path'   => getenv('SUNAT_CERT_PATH') ?: __DIR__ . '/../certs/certificate.pem',

    /*
    |--------------------------------------------------------------------------
    | Datos Oficiales del Emisor (Farmacia)
    |--------------------------------------------------------------------------
    */
    'empresa' => [
        'ruc'              => getenv('SUNAT_RUC') ?: '10734577583',
        'razon_social'     => getenv('EMPRESA_RAZON_SOCIAL') ?: 'FARMACIA FARMAGEST',
        'nombre_comercial' => getenv('EMPRESA_NOMBRE_COMERCIAL') ?: 'FARMAGEST',
        'direccion'        => [
            'ubigeo'       => '150101',
            'departamento' => 'LIMA',
            'provincia'    => 'LIMA',
            'distrito'     => 'LIMA',
            'urbanizacion' => '-',
            'direccion'    => 'AV. PRINCIPAL 123'
        ]
    ]
];
