import {ordinal} from "./time";
import type {AtlasNode} from "./types";

/*
 * The topic of the First Temple prophets: Samuel, Elijah and Elisha, Isaiah
 * and Jeremiah, each beside the kings they spoke to. The figures and most of
 * the events are the main axis's own. The few events added here are the
 * scenes the course's "Who Am I?" clues tell about the prophets (Elijah on
 * Carmel, Naboth's vineyard, Isaiah and Shebna, Jeremiah's warning), each
 * with its chapter in the Bible. Their years are approximate and only order
 * the story, as the cards say.
 */
type Scene={id:string;title:string;year:number;rank:1|2;summary:string;ref:string;people:string[]};
const SCENES:Scene[]=[
 {id:"PR-01",title:"שמואל גדל במשכן שילה",year:-1065,rank:2,ref:"שמואל א׳ א–ג",people:["F-18","F-19","F-20"],
  summary:"חנה מקדישה את בנה שמואל לשירות במשכן שילה, והוא גדל אצל עלי הכהן. שם הוא מתחיל לנבא."},
 {id:"PR-02",title:"אליהו מול נביאי הבעל בכרמל",year:-860,rank:1,ref:"מלכים א׳ יח",people:["F-33","F-31","F-32"],
  summary:"לפי המקרא התמודד אליהו עם נביאי הבעל בהר הכרמל, בימי אחאב ואיזבל."},
 {id:"PR-03",title:"כרם נבות",year:-855,rank:1,ref:"מלכים א׳ כא",people:["F-34","F-31","F-32","F-33"],
  summary:"אחאב חומד את כרם נבות ביזרעאל. איזבל שולחת מכתבים בשמו, נבות מורשע בעלילת שווא ומוצא להורג, ואליהו יוצא להוכיח את אחאב."},
 {id:"PR-04",title:"אלישע ממשיך את דרכו של אליהו",year:-850,rank:2,ref:"מלכים ב׳ ב",people:["F-33","F-38"],
  summary:"אלישע, תלמידו של אליהו, ממשיך את דרכו. בהמשך הוא שולח תלמיד למשוח את יהוא למלך."},
 {id:"PR-05",title:"ישעיהו מוכיח את שבנא",year:-703,rank:2,ref:"ישעיהו כב, טו–יט",people:["F-44","F-49"],
  summary:"ישעיהו מוכיח את שבנא, הממונה על הבית בחצר חזקיהו, על הקבר המפואר שחצב לעצמו בסלע: 'מה לך פה ומי לך פה'."},
 {id:"PR-06",title:"מציאת ספר התורה והרפורמה של יאשיהו",year:-622,rank:1,ref:"מלכים ב׳ כב–כג",people:["F-52"],
  summary:"לפי המקרא נמצא ספר תורה במקדש, ויאשיהו מנהיג בעקבותיו רפורמה דתית."},
 {id:"PR-07",title:"ירמיהו מזהיר את צדקיהו",year:-589,rank:1,ref:"ירמיהו כז; לח",people:["F-51","F-54"],
  summary:"ירמיהו מזהיר את צדקיהו מפני מרד בבבל וקורא להיכנע כדי להציל את העיר. צדקיהו מורד, והמצור מסתיים בחורבן."},
];
export const PROPHET_SCENES:AtlasNode[]=SCENES.map(s=>({id:s.id,kind:"event",title:s.title,subtitle:"נביאים",date:s.ref,phase:"",from:ordinal(s.year),to:ordinal(s.year),rank:s.rank,summary:s.summary,
 fields:[{label:"מה מסופר?",text:s.summary},{label:"מקור",text:s.ref}],
 source:"מי אני? — דמויות הקורס, ובמקרא: "+s.ref+".",caution:"השנה בקירוב, ורק מסדרת את הסיפור על הציר.",related:s.people,originalHref:"/games/who-am-i"}));

/** The figures of the main axis in this topic, and its events there. */
export const PROPHET_PEOPLE=["F-18","F-19","F-20","F-21","F-23","F-31","F-32","F-33","F-34","F-36","F-38","F-41","F-43","F-44","F-45","F-47","F-48","F-49","F-50","F-51","F-52","F-54","P-003","P-004"];
export const PROPHET_EVENTS=["FT-04","FT-05","FT-13","FT-19","FT-20","FT-24","ST-002","ST-003","ST-004"];
