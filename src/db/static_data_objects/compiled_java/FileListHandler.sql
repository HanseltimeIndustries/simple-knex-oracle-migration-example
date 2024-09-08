-- Of course, RDS doesn't want this level of permission so we should undo this for RDS...
CREATE OR REPLACE AND COMPILE JAVA SOURCE NAMED "FileListHandler" AS
import java.lang.*;
import java.util.*;
import java.io.*;

public class FileListHandler
{
  public static String list (String path) {
    String list = "";
    File myFile = new File (path);
    String[] arrayList = myFile.list();
    
    Arrays.sort(arrayList, String.CASE_INSENSITIVE_ORDER);
    
    for (int i=0; i < arrayList.length; i++) {
      // Prevent directory listing expanding if we will blow VARCHAR2 limit.
      if ((list.length() + arrayList[i].length() + 1) > 32767)
        break;
        
      if (!list.equals(""))
        list += "," + arrayList[i];
      else
        list += arrayList[i];
    }
    return list;
  }
};