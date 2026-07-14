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
    fecha_prestamo: {
      type: Date,
      default: Date.now
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
