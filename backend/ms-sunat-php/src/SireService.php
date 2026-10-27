<?php

namespace App;

/**
 * Servicio para interactuar con la API REST de SUNAT SIRE
 * Maneja la autenticación OAuth 2.0 y consultas de RVIE (Ventas) y RCE (Compras).
 */
class SireService
{
    private $clientId;
    private $clientSecret;
    private $ruc;
    private $usuarioSol;
    private $claveSol;
    private $ambiente;

    // Endpoints oficiales SUNAT
    private const AUTH_URL = 'https://api-seguridad.sunat.gob.pe/v1/clientessol/%s/oauth2/token/';
    private const SIRE_API_URL = 'https://api-sire.sunat.gob.pe/v1/contribuyente/migeigv/libros';

    public function __construct(array $config)
    {
        $this->clientId     = $config['sire']['client_id'] ?? '';
        $this->clientSecret = $config['sire']['client_secret'] ?? '';
        $this->ruc          = $config['ruc'] ?? '';
        $this->usuarioSol   = $config['usuario_sol'] ?? '';
        $this->claveSol     = $config['clave_sol'] ?? '';
        $this->ambiente     = $config['ambiente'] ?? 'PRODUCCION';
    }

    /**
     * Solicita un token de acceso OAuth 2.0 a SUNAT
     */
    public function obtenerToken(): array
    {
        $url = sprintf(self::AUTH_URL, $this->clientId);

        $params = [
            'grant_type'    => 'password',
            'scope'         => 'https://api-sire.sunat.gob.pe',
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'username'      => $this->ruc . $this->usuarioSol,
            'password'      => $this->claveSol
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return [
                'exito' => false,
                'codigo' => 500,
                'mensaje' => 'Error de conexión con SUNAT OAuth: ' . $error
            ];
        }

        $data = json_decode($response, true);

        if ($httpCode === 200 && isset($data['access_token'])) {
            return [
                'exito' => true,
                'codigo' => 200,
                'token' => $data['access_token'],
                'expira_en' => $data['expires_in'] ?? 3600,
                'tipo' => $data['token_type'] ?? 'Bearer'
            ];
        }

        return [
            'exito' => false,
            'codigo' => $httpCode,
            'mensaje' => $data['error_description'] ?? $data['error'] ?? 'Error de autenticación con SUNAT',
            'detalle' => $data
        ];
    }

    /**
     * Consulta la propuesta de ventas (RVIE) para un periodo (formato YYYYMM, ej: 202610)
     */
    public function consultarPropuestaVentas(string $periodo, int $pagina = 1, int $porPagina = 20): array
    {
        $auth = $this->obtenerToken();
        if (!$auth['exito']) {
            return $auth;
        }

        $token = $auth['token'];
        $url = sprintf(
            '%s/rvie/propuesta/web/propuesta/%s/comprobantes?numPagina=%d&numTamPagina=%d',
            self::SIRE_API_URL,
            $periodo,
            $pagina,
            $porPagina
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 25);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return [
                'exito' => false,
                'codigo' => 500,
                'mensaje' => 'Error al consultar propuesta RVIE: ' . $error
            ];
        }

        $data = json_decode($response, true) ?: ['raw' => $response];

        return [
            'exito' => ($httpCode >= 200 && $httpCode < 300),
            'codigo' => $httpCode,
            'periodo' => $periodo,
            'datos' => $data
        ];
    }

    /**
     * Consulta la propuesta de compras (RCE) para un periodo (formato YYYYMM, ej: 202610)
     */
    public function consultarPropuestaCompras(string $periodo, int $pagina = 1, int $porPagina = 20): array
    {
        $auth = $this->obtenerToken();
        if (!$auth['exito']) {
            return $auth;
        }

        $token = $auth['token'];
        $url = sprintf(
            '%s/rce/propuesta/web/propuesta/%s/comprobantes?numPagina=%d&numTamPagina=%d',
            self::SIRE_API_URL,
            $periodo,
            $pagina,
            $porPagina
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 25);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return [
                'exito' => false,
                'codigo' => 500,
                'mensaje' => 'Error al consultar propuesta RCE: ' . $error
            ];
        }

        $data = json_decode($response, true) ?: ['raw' => $response];

        return [
            'exito' => ($httpCode >= 200 && $httpCode < 300),
            'codigo' => $httpCode,
            'periodo' => $periodo,
            'datos' => $data
        ];
    }
}
