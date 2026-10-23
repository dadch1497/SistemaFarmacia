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

// Cargar clase SunatService directamente si no está en vendor
if (!class_exists('App\\SunatService')) {
    require_once __DIR__ . '/../src/SunatService.php';
}

$config = require __DIR__ . '/../config/sunat.php';
$sunatService = new \App\SunatService($config);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Router simple
if ($method === 'GET' && ($uri === '/' || $uri === '/health' || $uri === '/actuator/health')) {
    echo json_encode([
        'status' => 'UP',
        'service' => 'ms-sunat-php',
        'ambiente' => $config['ambiente'],
        'emisor_ruc' => $config['ruc'],
        'greenter_disponible' => class_exists('\Greenter\See'),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'POST' && ($uri === '/factura' || $uri === '/sunat/factura')) {
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
        $resultado = $sunatService->emitirComprobante($data);
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

// Si la ruta no coincide
http_response_code(404);
echo json_encode([
    'error' => 'Ruta no encontrada',
    'uri' => $uri
], JSON_UNESCAPED_UNICODE);
