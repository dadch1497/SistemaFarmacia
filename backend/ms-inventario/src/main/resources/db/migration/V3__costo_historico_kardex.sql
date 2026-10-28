-- Preserve cost at the time of new movements. Historical rows deliberately remain NULL.
ALTER TABLE movimiento_kardex ADD COLUMN costo_unitario_registrado DECIMAL(10,2) NULL;
CREATE INDEX idx_kardex_sucursal_fecha ON movimiento_kardex(sucursal_id, fecha_hora);
