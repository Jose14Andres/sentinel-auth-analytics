const PERMISSIONS = {
  admin:    ['*'],
  analyst:  ['dashboard:read', 'reports:read', 'reports:export', 'data:read'],
  auditor:  ['audit:read', 'risks:read', 'policies:read', 'users:read'],
  operator: ['data:write', 'data:read'],
};

const authorize = (...requiredPermissions) => (req, res, next) => {
  const userRole = req.user?.role;
  if (!userRole) return res.status(403).json({ success: false, message: 'Sin rol asignado' });

  const userPermissions = PERMISSIONS[userRole] || [];

  if (userPermissions.includes('*')) return next();

  const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Tu rol (${userRole}) no tiene permiso para esta acción.`,
      required: requiredPermissions,
    });
  }
  next();
};

const canAccess = (role, permission) => {
  const perms = PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
};

module.exports = { authorize, canAccess, PERMISSIONS };
