<?php

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar autoloader de Composer si existe
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Cargar clases de servicio
if (!class_exists('App\\SunatService')) {
    require_once __DIR__ . '/../src/SunatService.php';
}
if (!class_exists('App\\SireService')) {
    require_once __DIR__ . '/../src/SireService.php';
}

$config = require __DIR__ . '/../config/sunat.php';
$sunatService = new \App\SunatService($config);
$sireService = new \App\SireService($config);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// 1. Health / Estado
if ($method === 'GET' && ($uri === '/' || $uri === '/health' || $uri === '/actuator/health')) {
    echo json_encode([
        'status' => 'UP',
        'service' => 'ms-sunat-php',
        'ambiente' => $config['ambiente'],
        'emisor_ruc' => $config['ruc'],
        'sire_habilitado' => !empty($config['sire']['client_id']),
        'greenter_disponible' => class_exists('\Greenter\See'),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// 2. Facturación Electrónica y Notas de Crédito (Greenter / UBL XML)
if ($method === 'POST' && (
    $uri === '/factura' || $uri === '/sunat/factura' || $uri === '/api/sunat/enviar' ||
    $uri === '/nota-credito' || $uri === '/sunat/nota-credito' || $uri === '/api/sunat/nota-credito'
)) {
    $inputRaw = file_get_contents('php://input');
    $data = json_decode($inputRaw, true);

    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Petición inválida. Se requiere un cuerpo JSON.'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    try {
        $tipoDoc = $data['tipoComprobante'] ?? ($data['tipoDocumento'] ?? '');
        $esNotaCredito = (
            $tipoDoc === 'NOTA_CREDITO' || 
            $tipoDoc === '07' || 
            strpos($uri, 'nota-credito') !== false
        );

        if ($esNotaCredito) {
            $resultado = $sunatService->emitirNotaCredito($data);
        } else {
            $resultado = $sunatService->emitirComprobante($data);
        }

        http_response_code(200);
        echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'estadoSunat' => 'ERROR',
            'codigoRespuesta' => '500',
            'descripcion' => 'Error interno al procesar comprobante: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 3. SIRE: Probar Autenticación OAuth 2.0
if ($method === 'GET' && ($uri === '/api/sire/token' || $uri === '/sire/token')) {
    $resp = $sireService->obtenerToken();
    http_response_code($resp['codigo'] ?? 200);
    echo json_encode($resp, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// 4. SIRE: Consultar Propuesta de Ventas (RVIE)
if ($method === 'GET' && preg_match('#^/api/sire/rvie/([0-9]{6})$#', $uri, $matches)) {
    $periodo = $matches[1];
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $porPagina = isset($_GET['porPagina']) ? (int)$_GET['porPagina'] : 20;

    $resp = $sireService->consultarPropuestaVentas($periodo, $pagina, $porPagina);
    http_response_code($resp['codigo'] ?? 200);
    echo json_encode($resp, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// 5. SIRE: Consultar Propuesta de Compras (RCE)
if ($method === 'GET' && preg_match('#^/api/sire/rce/([0-9]{6})$#', $uri, $matches)) {
    $periodo = $matches[1];
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $porPagina = isset($_GET['porPagina']) ? (int)$_GET['porPagina'] : 20;

    $resp = $sireService->consultarPropuestaCompras($periodo, $pagina, $porPagina);
    http_response_code($resp['codigo'] ?? 200);
    echo json_encode($resp, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// Si la ruta no coincide
http_response_code(404);
echo json_encode([
    'error' => 'Ruta no encontrada',
    'uri' => $uri
], JSON_UNESCAPED_UNICODE);
