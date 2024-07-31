# DataPump Builder

Note, while this felt like a good idea.  The oracle dbms_datapump library seems to hang without good logs or even supporting
information for how to determine the issue.  Because of this, we advise just setting up a slower less efficient - dev db -> local
db set of sql copy commands.

If Oracle documentation and support comes to light that makes this better, then you can have a seed file that does not
compromise the load on the database longer term.