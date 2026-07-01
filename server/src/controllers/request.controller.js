import {
  assignRequestTechnician,
  cancelRequest,
  createRequest,
  createRequestComment,
  getRequestById,
  listRequestComments,
  listRequests,
  updateAssignedRequestStatus,
  updateRequest,
  getActiveTechnicians,
  listAvailableRequestsForTechnician,
  takeRequest,
  releaseRequest,
} from '../services/request.service.js';

export const indexRequests = async (req, res) => {
  const result = await listRequests(req.user, req.query);

  res.status(200).json(result);
};

export const storeRequest = async (req, res) => {
  const request = await createRequest(req.user, req.body);

  res.status(201).json({
    message: 'Solicitud creada correctamente',
    request,
  });
};

export const showRequest = async (req, res) => {
  const request = await getRequestById(req.user, req.params.id);

  res.status(200).json({
    request,
  });
};

export const editRequest = async (req, res) => {
  const request = await updateRequest(req.user, req.params.id, req.body);

  res.status(200).json({
    message: 'Solicitud actualizada correctamente',
    request,
  });
};

export const assignRequest = async (req, res) => {
  const request = await assignRequestTechnician(req.user, req.params.id, req.body.technicianId);

  res.status(200).json({
    message: 'Tecnico asignado correctamente',
    request,
  });
};

export const changeRequestStatus = async (req, res) => {
  const request = await updateAssignedRequestStatus(req.user, req.params.id, req.body.status);

  res.status(200).json({
    message: 'Estado actualizado correctamente',
    request,
  });
};

export const removeRequest = async (req, res) => {
  const request = await cancelRequest(req.user, req.params.id);

  res.status(200).json({
    message: 'Solicitud cancelada correctamente',
    request,
  });
};

export const indexRequestComments = async (req, res) => {
  const result = await listRequestComments(req.user, req.params.id, req.query);

  res.status(200).json(result);
};

export const storeRequestComment = async (req, res) => {
  const comment = await createRequestComment(req.user, req.params.id, req.body);

  res.status(201).json({
    message: 'Comentario creado correctamente',
    comment,
  });
};

export const listTechnicians = async (req, res) => {
  const technicians = await getActiveTechnicians();
  res.status(200).json({
    success: true,
    technicians,
  });
};

export const indexAvailableRequests = async (req, res) => {
  const result = await listAvailableRequestsForTechnician(req.user, req.query);
  res.status(200).json(result);
};

export const takeRequestJob = async (req, res) => {
  const request = await takeRequest(req.user, req.params.id);
  res.status(200).json({
    message: 'Trabajo aceptado y asignado correctamente',
    request,
  });
};

export const releaseRequestJob = async (req, res) => {
  const request = await releaseRequest(req.user, req.params.id);
  res.status(200).json({
    message: 'Trabajo liberado y devuelto a la cola',
    request,
  });
};
