export function openSnackBar(snackbarInstance, message) {
  snackbarInstance.open(message, 'X', {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 2000,
  });
}
