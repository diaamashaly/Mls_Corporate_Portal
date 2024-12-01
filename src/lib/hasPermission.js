export default function hasPermission(permission) {
  const userData = localStorage.getItem("mls_portal_profile_data");

  if (userData) {
    const data = JSON.parse(userData);

    const userPermissions = data.user_permissions;

    if (userPermissions) {
      const permissionData = userPermissions.find(
        (item) => item.name === permission,
      );

      if (permissionData) {
        return permissionData.value;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}