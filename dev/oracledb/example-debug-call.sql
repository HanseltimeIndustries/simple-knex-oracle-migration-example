--- If your PL/SQL debug tool can't handle using thigns like host.docker.internal,
--- Then you can use this .sql to swap in your stored_procedure calls
--- and just have your debugger open a port and wait
exec DBMS_DEBUG_JDWP.CONNECT_TCP('host.docker.internal', '65000');

exec SelectAllDisciples();

exec DBMS_DEBUG_JDWP.DISCONNECT();