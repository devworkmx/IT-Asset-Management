-- Crear tabla de ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer ubicaciones"
  ON ubicaciones FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear ubicaciones"
  ON ubicaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar ubicaciones"
  ON ubicaciones FOR UPDATE
  TO authenticated
  USING (true);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar ubicaciones"
  ON ubicaciones FOR DELETE
  TO authenticated
  USING (true);

-- Insertar ubicaciones iniciales (los niveles existentes)
INSERT INTO ubicaciones (nombre) VALUES
  ('Puente'),
  ('Cubierta Principal'),
  ('Cubierta A'),
  ('Cubierta B'),
  ('Cubierta C'),
  ('Sala de Máquinas')
ON CONFLICT (nombre) DO NOTHING;
