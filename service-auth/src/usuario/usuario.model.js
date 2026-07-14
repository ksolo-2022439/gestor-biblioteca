import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true
    },
    contrasena: {
      type: String,
      required: [true, 'La contraseña es obligatoria']
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

usuarioSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.contrasena;
  return usuario;
};

export default model('Usuario', usuarioSchema);
