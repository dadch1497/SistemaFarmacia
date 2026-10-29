<?php

namespace App;

use DOMDocument;
use ZipArchive;
use Greenter\XMLSecLibs\Sunat\SignedXml;

class SunatService
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
        date_default_timezone_set('America/Lima');
    }

    public function montoEnLetras(float $monto): string
    {
        $enteros = (int)floor($monto);
        $centavos = (int)round(($monto - $enteros) * 100);
        return strtoupper("$enteros CON " . str_pad((string)$centavos, 2, '0', STR_PAD_LEFT) . "/100 SOLES");
    }

    public function generarXmlUbl21(
        string $tipoDoc,
        string $serie,
        string $numero,
        float $subtotal,
        float $igv,
        float $total,
        string $tipoDocCliente,
        string $numDocCliente,
        string $nomCliente,
        array $items
    ): string {
        date_default_timezone_set('America/Lima');
        $comprobante = "$serie-$numero";
        $fecha = date('Y-m-d');
        $hora = date('H:i:s');
        $montoLetras = $this->montoEnLetras($total);

        $rucEmisor = $this->config['ruc'];
        $razonSocialEmisor = $this->config['empresa']['razon_social'];
        $nombreComercial = $this->config['empresa']['nombre_comercial'];
        $ubigeo = $this->config['empresa']['direccion']['ubigeo'];
        $departamento = $this->config['empresa']['direccion']['departamento'];
        $provincia = $this->config['empresa']['direccion']['provincia'];
        $distrito = $this->config['empresa']['direccion']['distrito'];
        $direccion = $this->config['empresa']['direccion']['direccion'];

        $subtotalStr = number_format($subtotal, 2, '.', '');
        $igvStr = number_format($igv, 2, '.', '');
        $totalStr = number_format($total, 2, '.', '');

        $linesXml = '';
        foreach ($items as $idx => $it) {
            $lineId = $idx + 1;
            $cant = (float)($it['cantidad'] ?? 1);
            $cantStr = number_format($cant, 0, '.', '');
            $pu = (float)($it['precioUnitario'] ?? $total);
            $puStr = number_format($pu, 2, '.', '');
            $lineTot = round($cant * $pu, 2);
            $subtLine = round($lineTot / 1.18, 2);
            $subtLineStr = number_format($subtLine, 2, '.', '');
            $igvLine = round($lineTot - $subtLine, 2);
            $igvLineStr = number_format($igvLine, 2, '.', '');
            $valUnit = round($pu / 1.18, 2);
            $valUnitStr = number_format($valUnit, 2, '.', '');
            $desc = !empty($it['nombreProducto']) ? $it['nombreProducto'] : (!empty($it['descripcion']) ? $it['descripcion'] : ("ITEM " . $lineId));
            $descClean = htmlspecialchars(trim($desc), ENT_QUOTES | ENT_XML1, 'UTF-8');

            $linesXml .= <<<XML

    <cac:InvoiceLine>
        <cbc:ID>{$lineId}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="NIU">{$cantStr}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="PEN">{$subtLineStr}</cbc:LineExtensionAmount>
        <cac:PricingReference>
            <cac:AlternativeConditionPrice>
                <cbc:PriceAmount currencyID="PEN">{$puStr}</cbc:PriceAmount>
                <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
            </cac:AlternativeConditionPrice>
        </cac:PricingReference>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="PEN">{$igvLineStr}</cbc:TaxAmount>
            <cac:TaxSubtotal>
                <cbc:TaxableAmount currencyID="PEN">{$subtLineStr}</cbc:TaxableAmount>
                <cbc:TaxAmount currencyID="PEN">{$igvLineStr}</cbc:TaxAmount>
                <cac:TaxCategory>
                    <cbc:Percent>18.00</cbc:Percent>
                    <cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode>
                    <cac:TaxScheme>
                        <cbc:ID>1000</cbc:ID>
                        <cbc:Name>IGV</cbc:Name>
                        <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
                    </cac:TaxScheme>
                </cac:TaxCategory>
            </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Description><![CDATA[{$descClean}]]></cbc:Description>
            <cac:SellersItemIdentification>
                <cbc:ID>PROD-{$lineId}</cbc:ID>
            </cac:SellersItemIdentification>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="PEN">{$valUnitStr}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
XML;
        }

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ccts="urn:un:unece:uncefact:documentation:2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2"
         xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionContent>
            </ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>2.0</cbc:CustomizationID>
    <cbc:ID>{$comprobante}</cbc:ID>
    <cbc:IssueDate>{$fecha}</cbc:IssueDate>
    <cbc:IssueTime>{$hora}</cbc:IssueTime>
    <cbc:InvoiceTypeCode listID="0101">{$tipoDoc}</cbc:InvoiceTypeCode>
    <cbc:Note languageLocaleID="1000"><![CDATA[{$montoLetras}]]></cbc:Note>
    <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
    <cac:Signature>
        <cbc:ID>SIGN{$rucEmisor}</cbc:ID>
        <cac:SignatoryParty>
            <cac:PartyIdentification>
                <cbc:ID>{$rucEmisor}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name><![CDATA[{$razonSocialEmisor}]]></cbc:Name>
            </cac:PartyName>
        </cac:SignatoryParty>
        <cac:DigitalSignatureAttachment>
            <cac:ExternalReference>
                <cbc:URI>#SIGN{$rucEmisor}</cbc:URI>
            </cac:ExternalReference>
        </cac:DigitalSignatureAttachment>
    </cac:Signature>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="6">{$rucEmisor}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name><![CDATA[{$nombreComercial}]]></cbc:Name>
            </cac:PartyName>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName><![CDATA[{$razonSocialEmisor}]]></cbc:RegistrationName>
                <cac:RegistrationAddress>
                    <cbc:ID>{$ubigeo}</cbc:ID>
                    <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
                    <cbc:CityName>{$provincia}</cbc:CityName>
                    <cbc:CountrySubentity>{$departamento}</cbc:CountrySubentity>
                    <cbc:District>{$distrito}</cbc:District>
                    <cac:AddressLine>
                        <cbc:Line><![CDATA[{$direccion}]]></cbc:Line>
                    </cac:AddressLine>
                    <cac:Country>
                        <cbc:IdentificationCode>PE</cbc:IdentificationCode>
                    </cac:Country>
                </cac:RegistrationAddress>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="{$tipoDocCliente}">{$numDocCliente}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName><![CDATA[{$nomCliente}]]></cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:PaymentTerms>
        <cbc:ID>FormaPago</cbc:ID>
        <cbc:PaymentMeansID>Contado</cbc:PaymentMeansID>
    </cac:PaymentTerms>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="PEN">{$igvStr}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="PEN">{$subtotalStr}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="PEN">{$igvStr}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cac:TaxScheme>
                    <cbc:ID>1000</cbc:ID>
                    <cbc:Name>IGV</cbc:Name>
                    <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="PEN">{$subtotalStr}</cbc:LineExtensionAmount>
        <cbc:TaxInclusiveAmount currencyID="PEN">{$totalStr}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="PEN">{$totalStr}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>{$linesXml}
</Invoice>
XML;
        return $xml;
    }

    public function emitirComprobante(array $datos): array
    {
        date_default_timezone_set('America/Lima');
        $tipo = $datos['tipoComprobante'] ?? 'BOLETA';
        $tipoDoc = ($tipo === 'FACTURA') ? '01' : '03';
        $serie = $datos['serie'] ?? ($tipo === 'FACTURA' ? 'F001' : 'B001');
        $numero = str_pad((string)($datos['numero'] ?? '4'), 8, '0', STR_PAD_LEFT);
        $comprobante = "$serie-$numero";

        $items = $datos['items'] ?? ($datos['detalles'] ?? []);
        if (empty($items)) {
            $items = [
                [
                    'productoId' => 1,
                    'nombreProducto' => 'PARACETAMOL 500 MG',
                    'cantidad' => 1,
                    'precioUnitario' => (float)($datos['total'] ?? 0.90)
                ]
            ];
        }

        $calcSubtotal = 0;
        $calcIgv = 0;
        $calcTotal = 0;
        foreach ($items as $it) {
            $cant = (float)($it['cantidad'] ?? 1);
            $pu = (float)($it['precioUnitario'] ?? 0);
            $lineTot = round($cant * $pu, 2);
            $subtLine = round($lineTot / 1.18, 2);
            $igvLine = round($lineTot - $subtLine, 2);
            $calcSubtotal += $subtLine;
            $calcIgv += $igvLine;
            $calcTotal += $lineTot;
        }

        $total = round($calcTotal, 2);
        $subtotal = round($calcSubtotal, 2);
        $igv = round($calcIgv, 2);

        $cliente = $datos['cliente'] ?? [];
        $numDocCliente = trim($cliente['numeroDocumento'] ?? ($datos['clienteNumeroDocumento'] ?? '00000000'));
        $nomCliente = trim(!empty($cliente['nombresORazonSocial']) ? $cliente['nombresORazonSocial'] : (!empty($cliente['razonSocial']) ? $cliente['razonSocial'] : ($datos['clienteNombre'] ?? 'CLIENTES VARIOS')));

        $tipoDocCliente = '0';
        if (($cliente['tipoDocumento'] ?? '') === 'RUC' || strlen($numDocCliente) === 11) {
            $tipoDocCliente = '6';
        } elseif (($cliente['tipoDocumento'] ?? '') === 'DNI' || (strlen($numDocCliente) === 8 && $numDocCliente !== '00000000')) {
            $tipoDocCliente = '1';
        } else {
            $tipoDocCliente = '0';
            $numDocCliente = '00000000';
            $nomCliente = 'CLIENTES VARIOS';
        }

        // 1. Generar XML UBL 2.1
        $xmlUnsigned = $this->generarXmlUbl21($tipoDoc, $serie, $numero, $subtotal, $igv, $total, $tipoDocCliente, $numDocCliente, $nomCliente, $items);

        // 2. Firmar XML
        $certPath = $this->config['cert_path'];
        if (!file_exists($certPath)) {
            throw new \Exception("Certificado digital no encontrado en $certPath");
        }
        $certContent = file_get_contents($certPath);

        $signer = new SignedXml();
        $signer->setCertificate($certContent);

        $doc = new DOMDocument();
        $doc->loadXML($xmlUnsigned);
        $signer->sign($doc);
        $xmlSigned = $doc->saveXML();

        $hashCpe = '';
        if (preg_match('/<ds:DigestValue>(.*?)<\/ds:DigestValue>/', $xmlSigned, $m)) {
            $hashCpe = trim($m[1]);
        }

        // 3. Empaquetar en ZIP
        $rucEmisor = $this->config['ruc'];
        $zipFileName = "{$rucEmisor}-{$tipoDoc}-{$comprobante}.zip";
        $xmlFileName = "{$rucEmisor}-{$tipoDoc}-{$comprobante}.xml";

        $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sunat_' . uniqid();
        @mkdir($tempDir, 0777, true);
        $zipFilePath = $tempDir . DIRECTORY_SEPARATOR . $zipFileName;

        $zip = new ZipArchive();
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception("No se pudo crear el archivo ZIP temporal.");
        }
        $zip->addFromString($xmlFileName, $xmlSigned);
        $zip->close();

        $zipContentBase64 = base64_encode(file_get_contents($zipFilePath));

        // 4. Enviar vía SOAP a SUNAT sendBill
        $ambiente = $this->config['ambiente'];
        $endpointSunat = ($ambiente === 'PRODUCCION')
            ? 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService'
            : 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem/billService';

        $usuarioSol = $this->config['usuario_sol'];
        $claveSol = $this->config['clave_sol'];

        $soapEnvelope = '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
   <soapenv:Header>
      <wsse:Security>
         <wsse:UsernameToken>
            <wsse:Username>' . $rucEmisor . $usuarioSol . '</wsse:Username>
            <wsse:Password>' . $claveSol . '</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <ser:sendBill>
         <fileName>' . $zipFileName . '</fileName>
         <contentFile>' . $zipContentBase64 . '</contentFile>
      </ser:sendBill>
   </soapenv:Body>
</soapenv:Envelope>';

        $ch = curl_init($endpointSunat);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $soapEnvelope);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "urn:sendBill"'
        ]);
        $soapResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Limpiar temporales
        @unlink($zipFilePath);
        @rmdir($tempDir);

        // Guardar XML firmado
        $storageDir = __DIR__ . '/../storage/comprobantes';
        if (!is_dir($storageDir)) @mkdir($storageDir, 0777, true);
        @file_put_contents("$storageDir/$xmlFileName", $xmlSigned);

        // 5. Analizar CDR de respuesta
        if ($httpCode === 200 && preg_match('/<applicationResponse>(.*?)<\/applicationResponse>/', $soapResponse, $mCdr)) {
            $cdrBase64 = trim($mCdr[1]);
            $cdrZipContent = base64_decode($cdrBase64);
            $cdrZipPath = "$storageDir/R-{$zipFileName}";
            @file_put_contents($cdrZipPath, $cdrZipContent);

            $codigoCdr = '0';
            $descripcionCdr = "El comprobante $comprobante ha sido aceptado por SUNAT";
            $za = new ZipArchive();
            if ($za->open($cdrZipPath) === true) {
                $cdrXmlContent = $za->getFromIndex(0);
                $za->close();
                if ($cdrXmlContent) {
                    if (preg_match('/<cbc:ResponseCode>(.*?)<\/cbc:ResponseCode>/', $cdrXmlContent, $mRc)) $codigoCdr = trim($mRc[1]);
                    if (preg_match('/<cbc:Description>(.*?)<\/cbc:Description>/', $cdrXmlContent, $mDs)) $descripcionCdr = trim($mDs[1]);
                }
            }

            return [
                'estadoSunat'     => ($codigoCdr === '0' || $codigoCdr === '0004') ? 'ACEPTADA' : 'RECHAZADA',
                'codigoRespuesta' => $codigoCdr,
                'descripcion'     => $descripcionCdr,
                'serie'           => $serie,
                'numero'          => $numero,
                'hashCpe'         => $hashCpe,
                'xml'             => base64_encode($xmlSigned),
                'cdrZip'          => $cdrBase64,
                'ambiente'        => $ambiente
            ];
        } else {
            $errorMsg = "Error HTTP $httpCode al enviar a SUNAT";
            $errorCode = (string)$httpCode;
            if (preg_match('/<faultstring>(.*?)<\/faultstring>/', $soapResponse, $mFault)) {
                $errorMsg = trim($mFault[1]);
            }
            if (preg_match('/<faultcode>(.*?)<\/faultcode>/', $soapResponse, $mCode)) {
                $errorCode = trim($mCode[1]);
            }

            return [
                'estadoSunat'     => 'RECHAZADA',
                'codigoRespuesta' => $errorCode,
                'descripcion'     => $errorMsg,
                'serie'           => $serie,
                'numero'          => $numero,
                'hashCpe'         => $hashCpe,
                'xml'             => base64_encode($xmlSigned),
                'cdrZip'          => null,
                'ambiente'        => $ambiente
            ];
        }
    }

    public function emitirNotaCredito(array $datos): array
    {
        return $this->emitirComprobante($datos);
    }
}

