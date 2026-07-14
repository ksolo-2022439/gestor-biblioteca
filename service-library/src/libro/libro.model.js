import { Schema, model } from 'mongoose';

const libroSchema = new Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true
    },
    autor: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true
    },
    anio: {
      type: Number
    },
    disponible: {
      type: Boolean,
      default: true
    },
    veces_prestado: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model('Libro', libroSchema);
