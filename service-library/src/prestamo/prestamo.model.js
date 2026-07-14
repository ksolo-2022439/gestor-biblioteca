import { Schema, model } from 'mongoose';

const prestamoSchema = new Schema(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      required: [true, 'El ID de usuario es obligatorio']
    },
    libro_id: {
      type: Schema.Types.ObjectId,
      ref: 'Libro',
      required: [true, 'El ID de libro es obligatorio']
    },
    nombre_prestatario: {
      type: String,
      required: [true, 'El nombre del prestatario es obligatorio'],
      trim: true
    },
    apellido_prestatario: {
      type: String,
      required: [true, 'El apellido del prestatario es obligatorio'],
      trim: true
    },
    dpi: {
      type: String,
      required: [true, 'El DPI es obligatorio'],
      trim: true
    },
    contacto: {
      type: String,
      required: [true, 'El número o correo de contacto es obligatorio'],
      trim: true
    },
    fecha_prestamo: {
      type: Date,
      default: Date.now
    },
    fecha_retorno_limite: {
      type: Date,
      required: [true, 'La fecha límite de retorno es obligatoria']
    },
    fecha_devolucion: {
      type: Date,
      default: null
    },
    estado: {
      type: String,
      enum: ['PRESTADO', 'DEVUELTO'],
      default: 'PRESTADO'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model('Prestamo', prestamoSchema);
