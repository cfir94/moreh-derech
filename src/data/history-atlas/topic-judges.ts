import {ordinal} from "./time";
import type {AtlasNode} from "./types";

/*
 * The topic of the judges: from Joshua's crossing to Saul, after the books of
 * Joshua, Judges, Ruth and the start of Samuel. The figures are the main
 * axis's own (the judges of "Who Am I?"); the scenes added here are the
 * stories the course's clues tell about them, each with its chapter. The
 * book of Judges gives no dates the course uses: the years are tradition and
 * only keep the order of the book, as every card says.
 */
type Scene={id:string;title:string;year:number;rank:1|2;summary:string;ref:string;people:string[]};
const SCENES:Scene[]=[
 {id:"JD-01",title:"עתניאל מושיע מכושן רשעתיים",year:-1190,rank:2,ref:"שופטים ג, ז–יא",people:["F-12"],
  summary:"עתניאל בן קנז, השופט הראשון, מושיע את ישראל משעבוד לכושן רשעתיים, ואחרי ניצחונו שוקטת הארץ ארבעים שנה."},
 {id:"JD-02",title:"אהוד בן גרא הורג את עגלון מלך מואב",year:-1170,rank:2,ref:"שופטים ג, יב–ל",people:["F-13"],
  summary:"אהוד, איטר יד ימינו, מביא מנחה לעגלון מלך מואב, הורג אותו בחרב מוסתרת ומוביל את המלחמה במואב."},
 {id:"JD-03",title:"דבורה וברק מול סיסרא בנחל קישון",year:-1150,rank:1,ref:"שופטים ד–ה",people:["F-14"],
  summary:"דבורה הנביאה וברק בן אבינועם מובילים את המאבק בצבא סיסרא, שר צבא יבין. שירת דבורה מתארת את התבוסה בנחל קישון."},
 {id:"JD-04",title:"גדעון והמלחמה במדיינים",year:-1120,rank:1,ref:"שופטים ו–ח",people:["F-15"],
  summary:"גדעון מוביל את המאבק במדיינים. לפני הקרב הוא מבקש אות בגיזת הצמר, ובמלחמה יוצאים עמו שלוש מאות איש."},
 {id:"JD-05",title:"רות בשדות בית לחם",year:-1100,rank:2,ref:"רות א–ד",people:["F-16"],
  summary:"\"ויהי בימי שפוט השופטים\": רות המואביה נשארת עם חמותה נעמי ומלקטת בשדות בית לחם. בנה עובד הוא סבו של דוד."},
 {id:"JD-06",title:"שמשון והפלישתים",year:-1078,rank:1,ref:"שופטים יג–טז",people:["F-17"],
  summary:"שמשון נלחם בפלישתים. אחרי שדלילה מסגירה אותו, הוא מביא לקריסת בית דגון על שוביו בעזה."},
 {id:"JD-07",title:"חנה מתפללת בשילה ושמואל נולד",year:-1065,rank:1,ref:"שמואל א׳ א–ג",people:["F-18","F-19","F-20"],
  summary:"חנה מתפללת בלחש במשכן שילה, ועלי הכהן חושב תחילה שהיא שיכורה. נולד לה שמואל, והיא מקדישה אותו לשירות במשכן אצל עלי."},
];
export const JUDGE_SCENES:AtlasNode[]=SCENES.map(s=>({id:s.id,kind:"event",title:s.title,subtitle:"שופטים",date:s.ref,phase:"",from:ordinal(s.year),to:ordinal(s.year),rank:s.rank,summary:s.summary,
 fields:[{label:"מה מסופר?",text:s.summary},{label:"מקור",text:s.ref}],
 source:"מי אני? — דמויות הקורס, ובמקרא: "+s.ref+".",caution:"מסורת מקראית: השנה רק מסדרת את סדר הספר על הציר, ואינה תאריך היסטורי.",related:s.people,originalHref:"/games/who-am-i"}));

/** The figures of the main axis in this topic, from Joshua to David, and its events there. */
export const JUDGE_PEOPLE=["F-11","F-12","F-13","F-14","F-15","F-16","F-17","F-18","F-19","F-20","F-21","F-22","F-23"];
export const JUDGE_EVENTS=["FT-03","EC-highlands","FT-04","FT-05","FT-06"];
