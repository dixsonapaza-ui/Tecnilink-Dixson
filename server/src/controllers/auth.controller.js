import {
  loginUser,
  registerClient,
} from '../services/auth.service.js';

export const register = async (req, res) => {
  const user = await registerClient(req.body);

  res.status(201).json({
    message: 'Usuario registrado correctamente',
    user,
  });
};

export const login = async (req, res) => {
  const session = await loginUser(req.body);

  res.status(200).json({
    message: 'Inicio de sesion exitoso',
    ...session,
  });
};

export const me = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};
