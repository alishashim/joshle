import { useEffect, useRef, useState } from 'react';

export function OutOfDaysDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!open) return null;

  return (
    <dialog ref={dialogRef} className="out-of-days-dialog" aria-labelledby="out-of-days-title" onClose={() => setOpen(false)}>
      <button className="out-of-days-close" type="button" aria-label="Close message" onClick={() => dialogRef.current?.close()}>×</button>
      <span className="out-of-days-kicker">A note from Josh</span>
      <h2 id="out-of-days-title">Josh ran out of places.</h2>
      <p>There isn’t a new day ready yet. If you want to keep the trips coming, send <strong>$5</strong> to <strong>@ALIHASHIM</strong> on Venmo.</p>
      <a className="out-of-days-venmo" href="https://venmo.com/alihashim" target="_blank" rel="noopener noreferrer">Venmo @ALIHASHIM <span aria-hidden="true">↗</span></a>
      <button className="out-of-days-play" type="button" onClick={() => dialogRef.current?.close()}>Play the latest day instead</button>
    </dialog>
  );
}
