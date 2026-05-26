import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  GraduationCap,
  FileText,
  Clock,
  Layers,
  Sigma,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Circle,
  PlayCircle,
  Cloud,
  CloudOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const initialCourses = [
  {
    id: 1,
    code: "010255102",
    nameTh: "ระเบียบวิธีวิจัยและสัมมนา",
    nameEn: "Research Methodology and Seminar",
    credits: "3(3-0-6)",
    category: "Research / Seminar",
    progress: 0,
    description: "แนวทางการวิจัยด้านวิศวกรรมการผลิตและหุ่นยนต์ การค้นหาบทความ การทบทวนวรรณกรรม การออกแบบการทดลอง การวิเคราะห์ข้อมูล การเขียนข้อเสนอและรายงานวิจัย",
    topics: [
      { id: 1001, title: "Research Topic Selection", status: "ยังไม่เริ่ม", summary: "การเลือกหัวข้อวิจัย การกำหนดปัญหา สมมติฐาน และวัตถุประสงค์การวิจัย", formula: "", resources: "Research proposal template" },
      { id: 1002, title: "Literature Review", status: "ยังไม่เริ่ม", summary: "การค้นหาบทความที่เกี่ยวข้อง การจัดกลุ่มงานวิจัย และการสร้าง literature review", formula: "", resources: "Google Scholar, Scopus, IEEE" },
      { id: 1003, title: "Experimental Design and Data Analysis", status: "ยังไม่เริ่ม", summary: "การออกแบบการทดลอง การเก็บข้อมูล การวิเคราะห์และตีความผล", formula: "", resources: "DOE notes" },
    ],
  },
  {
    id: 2,
    code: "010255103",
    nameTh: "คณิตศาสตร์และสถิติศาสตร์ประยุกต์",
    nameEn: "Applied Mathematics and Statistics",
    credits: "3(3-0-6)",
    category: "Mathematics / Statistics",
    progress: 0,
    description: "สถิติ การอนุมาน การถดถอย ANOVA/ANCOVA เมทริกซ์ ตัวแปรเชิงซ้อน Laplace/Fourier transform ODE PDE และการประยุกต์ใช้ในการวัด",
    topics: [
      { id: 2001, title: "Statistical Inference and Regression", status: "ยังไม่เริ่ม", summary: "หลักการอนุมานเชิงสถิติ การวิเคราะห์การถดถอย และการแปลผลทางวิศวกรรม", formula: "y = β0 + β1x + ε", resources: "Statistics textbook" },
      { id: 2002, title: "Matrix and Linear Transform", status: "ยังไม่เริ่ม", summary: "เมทริกซ์ การแปลงเชิงเส้น และการประยุกต์กับระบบสมการ", formula: "Ax = b", resources: "Linear algebra notes" },
      { id: 2003, title: "Laplace, Fourier, ODE and PDE", status: "ยังไม่เริ่ม", summary: "เครื่องมือคณิตศาสตร์สำหรับวิเคราะห์ระบบพลวัตและปัญหาทางวิศวกรรม", formula: "F(s)=L{f(t)}", resources: "Engineering math notes" },
    ],
  },
  {
    id: 3,
    code: "010255201",
    nameTh: "วิศวกรรมเซรามิกประยุกต์",
    nameEn: "Applied Ceramic Engineering",
    credits: "3(3-0-6)",
    category: "Materials / Ceramic",
    progress: 0,
    description: "หลักการวิศวกรรมเซรามิก ชนิดของเซรามิก วัตถุดิบ โครงสร้าง สมบัติ กระบวนการผลิตผง การขึ้นรูป การอบแห้ง การเผา การเคลือบ และการประยุกต์เซรามิกขั้นสูง",
    topics: [
      { id: 3001, title: "Ceramic Materials and Properties", status: "ยังไม่เริ่ม", summary: "ชนิด โครงสร้าง องค์ประกอบทางเคมี และสมบัติของวัสดุเซรามิก", formula: "", resources: "Ceramic engineering textbook" },
      { id: 3002, title: "Powder Processing and Forming", status: "ยังไม่เริ่ม", summary: "กระบวนการผลิตผง ขนาดอนุภาค การผสม และเทคนิคการขึ้นรูปเซรามิก", formula: "", resources: "Process notes" },
      { id: 3003, title: "Drying, Firing and Glaze Technology", status: "ยังไม่เริ่ม", summary: "เทคโนโลยีการอบแห้ง การเผา และการเคลือบผิวเซรามิก", formula: "", resources: "Lab manual" },
    ],
  },
  {
    id: 4,
    code: "010255202",
    nameTh: "วิศวกรรมแม่พิมพ์ประยุกต์",
    nameEn: "Applied Die Engineering",
    credits: "3(3-0-6)",
    category: "Manufacturing / Die Design",
    progress: 0,
    description: "กระบวนการผลิตชิ้นส่วนโลหะแผ่น การวางแผนแม่พิมพ์ วัสดุแม่พิมพ์ แม่พิมพ์ตัด ดัด ขึ้นรูป ต่อเนื่อง ผสม เคลื่อนย้าย การบำรุงรักษา ความปลอดภัย และ FEM สำหรับออกแบบแม่พิมพ์",
    topics: [
      { id: 4001, title: "Press Tooling Process Planning", status: "ยังไม่เริ่ม", summary: "การวางแผนกระบวนการผลิตแม่พิมพ์เพรสสำหรับชิ้นส่วนโลหะแผ่น", formula: "", resources: "Die design handbook" },
      { id: 4002, title: "Die Types and Design", status: "ยังไม่เริ่ม", summary: "แม่พิมพ์ตัด ดัด ขึ้นรูป ต่อเนื่อง ผสม และ transfer die", formula: "", resources: "CAD examples" },
      { id: 4003, title: "FEM for Die Design", status: "ยังไม่เริ่ม", summary: "การใช้ finite element method ช่วยวิเคราะห์และออกแบบแม่พิมพ์", formula: "[K][u]=[F]", resources: "FEA software tutorial" },
    ],
  },
  {
    id: 5,
    code: "010255203",
    nameTh: "การวิเคราะห์วิธีไฟไนต์เอลิเมนต์เชิงประยุกต์",
    nameEn: "Applied Finite Element Analysis",
    credits: "3(3-0-6)",
    category: "Manufacturing / Simulation",
    progress: 0,
    description: "PDE เชิงเส้น variational formulation Galerkin FEM finite element assembly error analysis mesh adaptation linear/nonlinear solvers และการประยุกต์ FEM ในอุตสาหกรรมการผลิต",
    topics: [
      { id: 5001, title: "Linear PDE and Weak Form", status: "ยังไม่เริ่ม", summary: "สมการเชิงอนุพันธ์ย่อยเชิงเส้นและการสร้างสมการแปรผันสำหรับ FEM", formula: "a(u,v)=L(v)", resources: "FEM textbook" },
      { id: 5002, title: "Galerkin Approximation and Assembly", status: "ยังไม่เริ่ม", summary: "การประมาณด้วยวิธีกาเลอคินและการประกอบ element เพื่อสร้างระบบสมการ", formula: "[K][u]=[F]", resources: "FEM coding notes" },
      { id: 5003, title: "Mesh Adaptation and Solvers", status: "ยังไม่เริ่ม", summary: "การควบคุม error ด้วย mesh adaptation และการแก้ระบบสมการเชิงเส้น/ไม่เชิงเส้น", formula: "e=u-u_h", resources: "Simulation case study" },
    ],
  },
  {
    id: 6,
    code: "010255204",
    nameTh: "การอบชุบทางความร้อนและวิศวกรรมพื้นผิวประยุกต์",
    nameEn: "Applied Heat Treatment and Surface Engineering",
    credits: "3(3-0-6)",
    category: "Materials / Surface Engineering",
    progress: 0,
    description: "โลหะกลุ่มเหล็กและนอกกลุ่มเหล็ก การอบชุบทางความร้อน การชุบผิวแข็ง martempering austempering induction carburizing boriding nitriding การควบคุมกระบวนการ คุณภาพ ความปลอดภัย และกรณีศึกษา",
    topics: [
      { id: 6001, title: "Steel and Heat Treatment Principles", status: "ยังไม่เริ่ม", summary: "ชนิดของเหล็ก สมบัติ และหลักการอบชุบทางความร้อน", formula: "", resources: "Metallurgy notes" },
      { id: 6002, title: "Surface Hardening Processes", status: "ยังไม่เริ่ม", summary: "carburizing, boriding, nitriding, induction hardening และกระบวนการเคมีความร้อน", formula: "", resources: "Process handbook" },
      { id: 6003, title: "Quality and Safety in Heat Treatment", status: "ยังไม่เริ่ม", summary: "การควบคุมคุณภาพ ความปลอดภัย และการวิเคราะห์สมบัติหลังการอบชุบ", formula: "", resources: "Case study" },
    ],
  },
  {
    id: 7,
    code: "010255205",
    nameTh: "ไตรโบโลยีอุตสาหกรรมประยุกต์",
    nameEn: "Applied Industrial Tribology",
    credits: "3(3-0-6)",
    category: "Mechanical / Tribology",
    progress: 0,
    description: "แรงเสียดทาน การสึกหรอ การหล่อลื่นในระบบกลไก tribotronics และ AI ใน tribology กลไกการสึกหรอ กลยุทธ์การหล่อลื่น และเทคนิคขั้นสูงเพื่อเพิ่มประสิทธิภาพอุตสาหกรรม",
    topics: [
      { id: 7001, title: "Friction, Wear and Lubrication", status: "ยังไม่เริ่ม", summary: "พื้นฐานแรงเสียดทาน การสึกหรอ และการหล่อลื่นในระบบกลไก", formula: "F=μN", resources: "Tribology textbook" },
      { id: 7002, title: "Wear Mechanism Classification", status: "ยังไม่เริ่ม", summary: "การจำแนกกลไกการสึกหรอและแนวทางวิเคราะห์ความเสียหาย", formula: "", resources: "Failure analysis notes" },
      { id: 7003, title: "AI and Advanced Tribology", status: "ยังไม่เริ่ม", summary: "การใช้ tribotronics และปัญญาประดิษฐ์ในระบบไตรโบโลยี", formula: "", resources: "Research papers" },
    ],
  },
  {
    id: 8,
    code: "010255206",
    nameTh: "การเฝ้าระวังสภาวะการทำงานของเครื่องจักรกลและสภาพของโครงสร้างประยุกต์",
    nameEn: "Applied Machine Condition and Structural Health Monitoring",
    credits: "3(3-0-6)",
    category: "Monitoring / Signal / ML",
    progress: 0,
    description: "เซนเซอร์ การเชื่อมต่อเซนเซอร์ การเก็บข้อมูล การปรับปรุงสัญญาณ การวิเคราะห์สัญญาณ vibration/sound acoustic emission sensor fusion machine learning pattern recognition และ lifetime estimation",
    topics: [
      { id: 8001, title: "Sensor Technology and Data Acquisition", status: "ยังไม่เริ่ม", summary: "เซนเซอร์ การเชื่อมต่อ การเก็บข้อมูลสัญญาณ และการปรับปรุงคุณภาพสัญญาณ", formula: "", resources: "DAQ lab" },
      { id: 8002, title: "Vibration and Acoustic Signal Analysis", status: "ยังไม่เริ่ม", summary: "การวิเคราะห์สัญญาณสั่นสะเทือน เสียง และ acoustic emission", formula: "FFT{x(t)}", resources: "Signal processing notes" },
      { id: 8003, title: "Machine Learning for Monitoring", status: "ยังไม่เริ่ม", summary: "sensor fusion, feature extraction, pattern recognition และการคาดการณ์อายุใช้งาน", formula: "ŷ=f(x)", resources: "ML case study" },
    ],
  },
  {
    id: 9,
    code: "010255207",
    nameTh: "เทคโนโลยีการผลิตประยุกต์",
    nameEn: "Applied Manufacturing Technology",
    credits: "3(3-0-6)",
    category: "Manufacturing / Precision",
    progress: 0,
    description: "กระบวนการผลิตสมัยใหม่ micro/nano manufacturing computer modeling 3D printing reverse engineering 3D scanning measurement precision engineering materials design SPC และ quality control",
    topics: [
      { id: 9001, title: "Modern and Micro/Nano Manufacturing", status: "ยังไม่เริ่ม", summary: "กระบวนการผลิตสมัยใหม่และกระบวนการผลิตระดับไมโคร/นาโน", formula: "", resources: "Manufacturing technology notes" },
      { id: 9002, title: "3D Printing, Reverse Engineering and 3D Scanning", status: "ยังไม่เริ่ม", summary: "การสร้างต้นแบบ การสแกนสามมิติ และการทำ reverse engineering", formula: "", resources: "CAD/scan lab" },
      { id: 9003, title: "SPC and Quality Control", status: "ยังไม่เริ่ม", summary: "การควบคุมกระบวนการทางสถิติและการควบคุมคุณภาพ", formula: "Cp=(USL-LSL)/6σ", resources: "SPC handbook" },
    ],
  },
  {
    id: 10,
    code: "010255208",
    nameTh: "การทดสอบและตรวจสอบลักษณะของวัสดุประยุกต์",
    nameEn: "Applied Material Characterization and Testing",
    credits: "3(3-0-6)",
    category: "Materials / Testing",
    progress: 0,
    description: "เทคนิคการทดสอบและตรวจสอบคุณลักษณะวัสดุ โครงสร้างจุลภาค องค์ประกอบ การเลือกเทคนิค การเตรียมชิ้นงาน และการแปลผล bulk/surface characterization",
    topics: [
      { id: 10001, title: "Material Characterization Techniques", status: "ยังไม่เริ่ม", summary: "เทคนิคการตรวจสอบโครงสร้างจุลภาคและองค์ประกอบของวัสดุ", formula: "", resources: "SEM/XRD notes" },
      { id: 10002, title: "Sample Preparation", status: "ยังไม่เริ่ม", summary: "การเตรียมชิ้นงานเพื่อการทดสอบและการตรวจสอบลักษณะวัสดุ", formula: "", resources: "Lab manual" },
      { id: 10003, title: "Result Interpretation", status: "ยังไม่เริ่ม", summary: "การตีความผลการตรวจสอบลักษณะเนื้อและผิววัสดุ", formula: "", resources: "Characterization reports" },
    ],
  },
  {
    id: 11,
    code: "010255209",
    nameTh: "กลศาสตร์การขึ้นรูปโลหะแผ่นประยุกต์",
    nameEn: "Applied Mechanics of Sheet Metal Forming",
    credits: "3(3-0-6)",
    category: "Sheet Metal / Forming",
    progress: 0,
    description: "ทฤษฎีการไหลพลาสติก พฤติกรรมการเสียรูป โลหะแผ่น plane stress stamping instability tearing bending springback shell analysis deep drawing stretch forming และ hydroforming",
    topics: [
      { id: 11001, title: "Plastic Flow Theory", status: "ยังไม่เริ่ม", summary: "ทฤษฎีการไหลพลาสติกและพฤติกรรมทางกลของโลหะแผ่น", formula: "σ=F/A", resources: "Metal forming textbook" },
      { id: 11002, title: "Stamping, Bending and Springback", status: "ยังไม่เริ่ม", summary: "การวิเคราะห์ stamping การดัด และการดีดตัวกลับ", formula: "", resources: "Forming simulation examples" },
      { id: 11003, title: "Deep Drawing and Hydroforming", status: "ยังไม่เริ่ม", summary: "พฤติกรรมการไหลพลาสติกใน deep drawing, stretch forming และ hydroforming", formula: "", resources: "Case studies" },
    ],
  },
  {
    id: 12,
    code: "010255210",
    nameTh: "การกัดกร่อนของโลหะและการควบคุมประยุกต์",
    nameEn: "Applied Metal Corrosion and Control",
    credits: "3(3-0-6)",
    category: "Materials / Corrosion",
    progress: 0,
    description: "หลักการ corrosion science electrochemical corrosion ประเภทการกัดกร่อน anodic/cathodic reaction polarization passivation การป้องกันและควบคุม การทดลองและอัตราการกัดกร่อน",
    topics: [
      { id: 12001, title: "Electrochemical Corrosion", status: "ยังไม่เริ่ม", summary: "หลักการกัดกร่อนทางเคมีไฟฟ้า ปฏิกิริยาอาโนดและคาโทด", formula: "i = I/A", resources: "Corrosion textbook" },
      { id: 12002, title: "Polarization and Passivation", status: "ยังไม่เริ่ม", summary: "ทฤษฎีโพลาไรเซชันและการเกิดพาสซิเวชัน", formula: "", resources: "Polarization curve lab" },
      { id: 12003, title: "Corrosion Testing and Control", status: "ยังไม่เริ่ม", summary: "เทคนิคการทดลอง การวิเคราะห์อัตราการกัดกร่อน และกลยุทธ์ควบคุม", formula: "CR = KΔW/(ρAt)", resources: "Lab manual" },
    ],
  },
  {
    id: 13,
    code: "010255211",
    nameTh: "การวิเคราะห์การขึ้นรูปโลหะประยุกต์",
    nameEn: "Applied Metal Forming Analysis",
    credits: "3(3-0-6)",
    category: "Metal Forming / Analysis",
    progress: 0,
    description: "stress/strain plastic behavior yield criteria strain hardening plastic instability strain rate temperature ideal work slab analysis upper bound slip-line bending anisotropy drawing FLD extrusion hydroforming และ formability test",
    topics: [
      { id: 13001, title: "Stress, Strain and Yield Criteria", status: "ยังไม่เริ่ม", summary: "ความเค้น ความเครียด พฤติกรรมพลาสติก และเกณฑ์การคราก", formula: "σ=Eε", resources: "Plasticity notes" },
      { id: 13002, title: "Slab, Upper Bound and Slip-Line Analysis", status: "ยังไม่เริ่ม", summary: "วิธีวิเคราะห์กระบวนการขึ้นรูปโลหะด้วย slab analysis, upper bound และ slip-line field", formula: "", resources: "Metal forming analysis text" },
      { id: 13003, title: "Forming Limit and Hydroforming", status: "ยังไม่เริ่ม", summary: "แผนภาพขีดจำกัดการขึ้นรูป การอัดขึ้นรูป และ hydroforming", formula: "", resources: "FLD case study" },
    ],
  },
  {
    id: 14,
    code: "010255212",
    nameTh: "การตรวจสอบแบบไม่ทำลายประยุกต์",
    nameEn: "Applied Non-destructive Testing",
    credits: "3(3-0-6)",
    category: "Inspection / NDT",
    progress: 0,
    description: "หลักการ NDT/NDE discontinuity defects reliability modern trends sensor/method development limitations standards specifications data analysis interpretation research application และกรณีศึกษา",
    topics: [
      { id: 14001, title: "NDT Principles and Methods", status: "ยังไม่เริ่ม", summary: "หลักการและวิธีทดสอบแบบไม่ทำลาย เช่น UT, RT, MT, PT และ ET", formula: "", resources: "NDT handbook" },
      { id: 14002, title: "Defects, Reliability and Standards", status: "ยังไม่เริ่ม", summary: "ความไม่ต่อเนื่อง สิ่งบกพร่อง ความน่าเชื่อถือ มาตรฐานและข้อกำหนด", formula: "", resources: "Inspection standards" },
      { id: 14003, title: "Data Interpretation and Case Study", status: "ยังไม่เริ่ม", summary: "การวิเคราะห์และตีความข้อมูลจากการตรวจสอบแบบไม่ทำลาย", formula: "", resources: "NDT reports" },
    ],
  },
  {
    id: 15,
    code: "010255213",
    nameTh: "กระบวนการขึ้นรูปพอลิเมอร์และคอมโพสิตประยุกต์",
    nameEn: "Applied Polymer and Composite Processing",
    credits: "3(3-0-6)",
    category: "Polymer / Composite",
    progress: 0,
    description: "rheology ของพลาสติก การทดสอบการไหล การปรับพารามิเตอร์ กระบวนการอัดขึ้นรูป hand lay-up vacuum forming extrusion blow molding blown film และ injection molding",
    topics: [
      { id: 15001, title: "Polymer Rheology", status: "ยังไม่เริ่ม", summary: "พฤติกรรมการไหลของพลาสติกระหว่างกระบวนการผลิต", formula: "η=τ/γ̇", resources: "Polymer processing textbook" },
      { id: 15002, title: "Composite and Polymer Forming Processes", status: "ยังไม่เริ่ม", summary: "compression molding, hand lay-up, vacuum forming และ extrusion", formula: "", resources: "Process videos" },
      { id: 15003, title: "Injection and Blow Molding", status: "ยังไม่เริ่ม", summary: "กระบวนการฉีดขึ้นรูป การเป่าภาชนะกลวง และการเป่าถุง", formula: "", resources: "Injection molding guide" },
    ],
  },
  {
    id: 16,
    code: "010255214",
    nameTh: "โลหะผงวิทยาประยุกต์",
    nameEn: "Applied Powder Metallurgy",
    credits: "3(3-0-6)",
    category: "Materials / Powder Metallurgy",
    progress: 0,
    description: "การผลิตและตรวจสอบผงโลหะ การปรับปรุงผง เทคโนโลยีการขึ้นรูป die compaction isostatic compaction dynamic compaction sintering hot consolidation powder injection molding microstructure secondary operation quality control และกรณีศึกษา",
    topics: [
      { id: 16001, title: "Metal Powder Production and Characterization", status: "ยังไม่เริ่ม", summary: "การผลิตและตรวจสอบคุณลักษณะเฉพาะของผงโลหะ", formula: "", resources: "Powder metallurgy notes" },
      { id: 16002, title: "Compaction and Sintering", status: "ยังไม่เริ่ม", summary: "การอัดขึ้นรูปผงโลหะ การซินเตอริง และ hot consolidation", formula: "", resources: "Sintering process guide" },
      { id: 16003, title: "Powder Injection Molding and Quality Control", status: "ยังไม่เริ่ม", summary: "การฉีดขึ้นรูปผง โครงสร้างจุลภาค และการควบคุมคุณภาพ", formula: "", resources: "Case study" },
    ],
  },
  {
    id: 17,
    code: "010255215",
    nameTh: "เรื่องคัดเฉพาะทางด้านวัสดุประยุกต์",
    nameEn: "Selected Topic in Applied Materials",
    credits: "3(3-0-6)",
    category: "Selected Topic / Materials",
    progress: 0,
    description: "การบรรยาย สัมมนา การค้นคว้าอิสระ และการศึกษาด้วยตนเองในหัวข้อประยุกต์ที่น่าสนใจทางวัสดุศาสตร์",
    topics: [
      { id: 17001, title: "Selected Materials Topic", status: "ยังไม่เริ่ม", summary: "เลือกหัวข้อวัสดุศาสตร์ประยุกต์ที่สนใจเพื่อศึกษาเชิงลึก", formula: "", resources: "Research papers" },
      { id: 17002, title: "Seminar and Independent Study", status: "ยังไม่เริ่ม", summary: "การจัดทำสรุปบทความและนำเสนอหัวข้อสัมมนา", formula: "", resources: "Seminar template" },
    ],
  },
  {
    id: 18,
    code: "010255216",
    nameTh: "เรื่องคัดเฉพาะทางด้านการผลิตประยุกต์",
    nameEn: "Selected Topic in Applied Production",
    credits: "3(3-0-6)",
    category: "Selected Topic / Production",
    progress: 0,
    description: "การบรรยาย สัมมนา การค้นคว้าอิสระ และการศึกษาด้วยตนเองในหัวข้อประยุกต์ที่น่าสนใจทางวิศวกรรมการผลิต",
    topics: [
      { id: 18001, title: "Selected Production Engineering Topic", status: "ยังไม่เริ่ม", summary: "เลือกหัวข้อวิศวกรรมการผลิตประยุกต์ที่สนใจเพื่อศึกษาเชิงลึก", formula: "", resources: "Research papers" },
      { id: 18002, title: "Independent Investigation", status: "ยังไม่เริ่ม", summary: "ค้นคว้า วิเคราะห์ และสรุปองค์ความรู้จากแหล่งข้อมูลทางวิชาการ", formula: "", resources: "Seminar template" },
    ],
  },
  {
    id: 19,
    code: "010255217",
    nameTh: "การวิเคราะห์ความสามารถในการขึ้นรูปได้ของโลหะแผ่นประยุกต์",
    nameEn: "Applied Sheet Metal Formability Analysis",
    credits: "3(3-0-6)",
    category: "Sheet Metal / Automotive",
    progress: 0,
    description: "วัสดุในอุตสาหกรรมยานยนต์ สมบัติกลโลหะแผ่น plastic anisotropy anisotropic coefficient mechanical test yield criteria experimental test FEM forming limit diagram และการประยุกต์ในยานยนต์",
    topics: [
      { id: 19001, title: "Sheet Metal Properties and Anisotropy", status: "ยังไม่เริ่ม", summary: "สมบัติทางกลของโลหะแผ่นและแอนไอโซโทรปีของสภาพพลาสติก", formula: "r = εw/εt", resources: "Formability notes" },
      { id: 19002, title: "Yield Criteria and Mechanical Testing", status: "ยังไม่เริ่ม", summary: "การทดสอบทางกลสำหรับเกณฑ์การครากและการทดสอบเชิงประลอง", formula: "", resources: "Lab data" },
      { id: 19003, title: "FLD and FEM Application", status: "ยังไม่เริ่ม", summary: "แผนภาพขีดจำกัดการขึ้นรูปและการประยุกต์ FEM ในอุตสาหกรรมยานยนต์", formula: "", resources: "FEA case study" },
    ],
  },
  {
    id: 20,
    code: "010255218",
    nameTh: "วิศวกรรมพลาสติกแบบยั่งยืนประยุกต์",
    nameEn: "Applied Sustainable Plastic Engineering",
    credits: "3(3-0-6)",
    category: "Plastic / Sustainability",
    progress: 0,
    description: "สมบัติพลาสติกและพลาสติกชีวภาพ การทดสอบและจำแนกพลาสติก การเตรียมพลาสติก การผลิตผลิตภัณฑ์พลาสติก การเชื่อมต่อ การรีไซเคิล และแนวโน้มผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม",
    topics: [
      { id: 20001, title: "Plastic and Bioplastic Properties", status: "ยังไม่เริ่ม", summary: "สมบัติของพลาสติกและพลาสติกชีวภาพ รวมถึงการทดสอบและจำแนกชนิด", formula: "", resources: "Plastic engineering text" },
      { id: 20002, title: "Plastic Processing and Joining", status: "ยังไม่เริ่ม", summary: "กระบวนการเตรียม ผลิต และเชื่อมต่อพลาสติก", formula: "", resources: "Processing guide" },
      { id: 20003, title: "Recycling and Sustainable Plastic", status: "ยังไม่เริ่ม", summary: "การรีไซเคิลพลาสติกและแนวโน้มผลิตภัณฑ์พลาสติกที่เป็นมิตรต่อสิ่งแวดล้อม", formula: "", resources: "Sustainability papers" },
    ],
  },
  {
    id: 21,
    code: "010255219",
    nameTh: "ความน่าเชื่อถือของระบบและการบำรุงรักษาประยุกต์",
    nameEn: "Applied System Reliability and Maintenance",
    credits: "3(3-0-6)",
    category: "Reliability / Maintenance",
    progress: 0,
    description: "ระเบียบวิธีการบำรุงรักษา reliability ของระบบซับซ้อน maintenance 1.0-4.0 digital maintenance sensor technology และการบูรณาการเทคนิคเพื่อกลยุทธ์การบำรุงรักษา",
    topics: [
      { id: 21001, title: "Reliability of Industrial Systems", status: "ยังไม่เริ่ม", summary: "ความน่าเชื่อถือของระบบที่ซับซ้อนในอุตสาหกรรม", formula: "R(t)=e^{-λt}", resources: "Reliability textbook" },
      { id: 21002, title: "Maintenance 1.0 to 4.0", status: "ยังไม่เริ่ม", summary: "แนวทางการบำรุงรักษาจากดั้งเดิมสู่ดิจิทัล", formula: "", resources: "Maintenance strategy notes" },
      { id: 21003, title: "Sensors and Digital Maintenance", status: "ยังไม่เริ่ม", summary: "เทคโนโลยีเซนเซอร์และเทคนิคบำรุงรักษาแบบดิจิทัล", formula: "", resources: "Industry 4.0 case study" },
    ],
  },
  {
    id: 22,
    code: "010255301",
    nameTh: "ปัญญาประดิษฐ์ประยุกต์",
    nameEn: "Applied Artificial Intelligence",
    credits: "3(3-0-6)",
    category: "AI / Robotics",
    progress: 0,
    description: "AI expert system NLP machine learning prediction clustering classification neural network deep learning และ problem-based learning สำหรับงานอุตสาหกรรมและหุ่นยนต์",
    topics: [
      { id: 22001, title: "AI and Expert Systems", status: "ยังไม่เริ่ม", summary: "พื้นฐานปัญญาประดิษฐ์และระบบผู้เชี่ยวชาญ", formula: "", resources: "AI textbook" },
      { id: 22002, title: "Machine Learning, Prediction and Classification", status: "ยังไม่เริ่ม", summary: "การเรียนรู้ของเครื่อง การทำนาย การจัดกลุ่ม และการจำแนกประเภทข้อมูล", formula: "ŷ=f(x;θ)", resources: "Python/scikit-learn" },
      { id: 22003, title: "Neural Network and Deep Learning", status: "ยังไม่เริ่ม", summary: "โครงข่ายประสาทเทียม deep learning และการประยุกต์กับงานอุตสาหกรรมและหุ่นยนต์", formula: "a=σ(Wx+b)", resources: "Deep learning notes" },
    ],
  },
  {
    id: 23,
    code: "010255302",
    nameTh: "ระบบอัตโนมัติประยุกต์",
    nameEn: "Applied Automation",
    credits: "3(3-0-6)",
    category: "Automation / Control",
    progress: 0,
    description: "control system closed-loop control microprocessor sequential control electrical pneumatic hydraulic PLC และการประยุกต์ในการผลิต",
    topics: [
      { id: 23001, title: "Closed-loop Control System", status: "ยังไม่เริ่ม", summary: "ระบบควบคุมแบบวงรอบปิด โครงสร้าง feedback และการประยุกต์", formula: "e(t)=r(t)-y(t)", resources: "Control system notes" },
      { id: 23002, title: "Microprocessor and Sequential Control", status: "ยังไม่เริ่ม", summary: "โครงสร้างไมโครโปรเซสเซอร์และการควบคุมแบบลำดับ", formula: "", resources: "Embedded/PLC notes" },
      { id: 23003, title: "PLC, Pneumatic and Hydraulic Systems", status: "ยังไม่เริ่ม", summary: "การควบคุมระบบไฟฟ้า นิวแมติก ไฮดรอลิก และ PLC ในการผลิต", formula: "", resources: "PLC lab" },
    ],
  },
  {
    id: 24,
    code: "010255303",
    nameTh: "การประมวลผลภาพประยุกต์",
    nameEn: "Applied Image Processing",
    credits: "3(3-0-6)",
    category: "Image Processing / Machine Vision",
    progress: 0,
    description: "เทคนิคการประมวลผลภาพ image enhancement segmentation feature extraction object recognition และการใช้งานร่วมกับ machine vision",
    topics: [
      { id: 24001, title: "Image Enhancement", status: "ยังไม่เริ่ม", summary: "เทคนิคการปรับปรุงคุณภาพภาพเพื่อเพิ่มความชัดเจนและลด noise", formula: "g(x,y)=T[f(x,y)]", resources: "OpenCV tutorial" },
      { id: 24002, title: "Segmentation and Feature Extraction", status: "ยังไม่เริ่ม", summary: "การแบ่งส่วนภาพและการสกัดคุณลักษณะเด่นจากภาพ", formula: "", resources: "Machine vision notes" },
      { id: 24003, title: "Object Recognition and Machine Vision", status: "ยังไม่เริ่ม", summary: "การรู้จำวัตถุบนภาพและการประยุกต์กับระบบแมชชีนวิชชัน", formula: "", resources: "Vision case study" },
    ],
  },
  {
    id: 25,
    code: "010255304",
    nameTh: "การควบคุมสมัยใหม่ประยุกต์",
    nameEn: "Applied Modern Control",
    credits: "3(3-0-6)",
    category: "Control / Modern Control",
    progress: 0,
    description: "modern control state-space multivariable control nonlinear/robust/adaptive control optimal control model predictive control และหัวข้อใหม่ทางระบบควบคุม",
    topics: [
      { id: 25001, title: "State-space Representation", status: "ยังไม่เริ่ม", summary: "การแสดงผลระบบในปริภูมิสเตทและการวิเคราะห์ระบบควบคุมสมัยใหม่", formula: "ẋ=Ax+Bu", resources: "Modern control textbook" },
      { id: 25002, title: "Robust, Nonlinear and Adaptive Control", status: "ยังไม่เริ่ม", summary: "หลักการควบคุมแบบคงทน ไม่เชิงเส้น และปรับตัวได้", formula: "", resources: "Control papers" },
      { id: 25003, title: "Optimal Control and MPC", status: "ยังไม่เริ่ม", summary: "ทฤษฎีการควบคุมเหมาะสมที่สุดและ model predictive control", formula: "min J", resources: "MPC tutorial" },
    ],
  },
  {
    id: 26,
    code: "010255305",
    nameTh: "วิศวกรรมความเที่ยงตรงประยุกต์สำหรับการออกแบบหุ่นยนต์",
    nameEn: "Applied Precision Engineering for Robot Design",
    credits: "3(3-0-6)",
    category: "Robotics / Precision Engineering",
    progress: 0,
    description: "high-precision robotic design locomotion drive automation industrial robot robot arm collaborative robot microrobot gripper gear motor actuator precision positioning bearing feedback sensor และ fluid dynamics สำหรับหุ่นยนต์เที่ยงตรงสูง",
    topics: [
      { id: 26001, title: "High-precision Robot Design", status: "ยังไม่เริ่ม", summary: "กระบวนการออกแบบระบบหุ่นยนต์ความเที่ยงตรงสูงและการประยุกต์ใช้งาน", formula: "", resources: "Precision design notes" },
      { id: 26002, title: "Drive, Actuator and Precision Positioning", status: "ยังไม่เริ่ม", summary: "ระบบขับเคลื่อน มอเตอร์ แอคชูเอเตอร์ แบริ่ง และการกำหนดตำแหน่งที่เที่ยงตรง", formula: "error=target-actual", resources: "Robot stage case study" },
      { id: 26003, title: "Robot Arm, Gripper and Feedback Sensor", status: "ยังไม่เริ่ม", summary: "แขนกล มือจับหุ่นยนต์ และเซนเซอร์ป้อนกลับสำหรับระบบหุ่นยนต์", formula: "", resources: "Robot design examples" },
    ],
  },
  {
    id: 27,
    code: "010255306",
    nameTh: "ระบบปฏิบัติการหุ่นยนต์ประยุกต์",
    nameEn: "Applied Robot Operating System",
    credits: "3(3-0-6)",
    category: "Robotics / ROS",
    progress: 0,
    description: "holonomic/non-holonomic locomotion robot arm manipulation indoor localization mapping path planning navigation ROS ecosystem development tools robot sensors และ visual perception",
    topics: [
      { id: 27001, title: "ROS Ecosystem and Development Tools", status: "ยังไม่เริ่ม", summary: "ระบบนิเวศ ROS เครื่องมือพัฒนา node topic service และ package", formula: "", resources: "ROS documentation" },
      { id: 27002, title: "Localization, Mapping and Navigation", status: "ยังไม่เริ่ม", summary: "การระบุตำแหน่งในอาคาร การทำแผนที่ การนำทาง และการวางแผนเส้นทาง", formula: "", resources: "SLAM tutorial" },
      { id: 27003, title: "Robot Arm and Visual Perception", status: "ยังไม่เริ่ม", summary: "การเคลื่อนที่ของแขนกล เซนเซอร์ และการรับรู้ด้วยภาพของหุ่นยนต์", formula: "", resources: "MoveIt/OpenCV examples" },
    ],
  },
  {
    id: 28,
    code: "010255307",
    nameTh: "เรื่องคัดเฉพาะทางด้านการควบคุมประยุกต์",
    nameEn: "Selected Topic in Applied Control",
    credits: "3(3-0-6)",
    category: "Selected Topic / Control",
    progress: 0,
    description: "การบรรยาย สัมมนา การค้นคว้าอิสระ และการศึกษาด้วยตนเองในหัวข้อที่น่าสนใจทางระบบควบคุมประยุกต์",
    topics: [
      { id: 28001, title: "Selected Control Topic", status: "ยังไม่เริ่ม", summary: "เลือกหัวข้อระบบควบคุมประยุกต์ที่สนใจเพื่อศึกษาลึก", formula: "", resources: "Research papers" },
      { id: 28002, title: "Control Seminar and Review", status: "ยังไม่เริ่ม", summary: "การอ่านบทความ สรุป และนำเสนอหัวข้อระบบควบคุม", formula: "", resources: "Seminar template" },
    ],
  },
  {
    id: 29,
    code: "010255308",
    nameTh: "เรื่องคัดเฉพาะทางด้านวิทยาการหุ่นยนต์ประยุกต์",
    nameEn: "Selected Topic in Applied Robotics",
    credits: "3(3-0-6)",
    category: "Selected Topic / Robotics AI",
    progress: 0,
    description: "การบรรยาย สัมมนา การค้นคว้าอิสระ และการศึกษาด้วยตนเองในหัวข้อที่น่าสนใจทางวิทยาการหุ่นยนต์ประยุกต์และ AI",
    topics: [
      { id: 29001, title: "Selected Robotics and AI Topic", status: "ยังไม่เริ่ม", summary: "เลือกหัวข้อหุ่นยนต์ประยุกต์หรือ AI ที่สนใจเพื่อศึกษาลึก", formula: "", resources: "Research papers" },
      { id: 29002, title: "Robotics Seminar and Independent Study", status: "ยังไม่เริ่ม", summary: "การค้นคว้าอิสระและการนำเสนอหัวข้อด้านหุ่นยนต์และ AI", formula: "", resources: "Seminar template" },
    ],
  },
  {
    id: 30,
    code: "010255309",
    nameTh: "เซนเซอร์และแอคชูเอเตอร์ประยุกต์",
    nameEn: "Applied Sensor and Actuator",
    credits: "3(3-0-6)",
    category: "Sensors / Actuators / MEMS",
    progress: 0,
    description: "sensor and actuator technology sensor interfacing data acquisition signal processing control/monitoring MEMS sensing microtechnology for MEMS fabrication และ robotics application",
    topics: [
      { id: 30001, title: "Sensor and Actuator Technology", status: "ยังไม่เริ่ม", summary: "เทคโนโลยีเซนเซอร์และแอคชูเอเตอร์สำหรับระบบควบคุมและติดตาม", formula: "", resources: "Sensor handbook" },
      { id: 30002, title: "Interfacing, DAQ and Signal Processing", status: "ยังไม่เริ่ม", summary: "การเชื่อมต่อเซนเซอร์ การเก็บข้อมูล และการประมวลผลสัญญาณ", formula: "V=IR", resources: "DAQ lab" },
      { id: 30003, title: "MEMS and Robotics Applications", status: "ยังไม่เริ่ม", summary: "การตรวจจับ MEMS เทคโนโลยีจุลภาค และการประยุกต์ในหุ่นยนต์", formula: "", resources: "MEMS notes" },
    ],
  },
  {
    id: 31,
    code: "010255310",
    nameTh: "การประมวลผลสัญญาณประยุกต์",
    nameEn: "Applied Signal Processing",
    credits: "3(3-0-6)",
    category: "Signal Processing / Automation",
    progress: 0,
    description: "discrete-time signal and system Fourier transform frequency response Nyquist theorem Laplace/z-transform digital filter ADC/DAC spectral analysis wavelet feature extraction/selection และ robotics/automation applications",
    topics: [
      { id: 31001, title: "Discrete-time Signal and Fourier Transform", status: "ยังไม่เริ่ม", summary: "การวิเคราะห์สัญญาณเวลาไม่ต่อเนื่องและการแปลงฟูเรียร์", formula: "X(e^{jω})", resources: "DSP textbook" },
      { id: 31002, title: "Digital Filter, ADC and DAC", status: "ยังไม่เริ่ม", summary: "การออกแบบตัวกรองดิจิทัลและการแปลงสัญญาณระหว่างแอนะล็อก/ดิจิทัล", formula: "H(z)=Y(z)/X(z)", resources: "Filter design notes" },
      { id: 31003, title: "Spectral, Wavelet and Feature Extraction", status: "ยังไม่เริ่ม", summary: "การวิเคราะห์สเปกตรัม การแปลงเวฟเล็ต และการสกัด/เลือกคุณลักษณะ", formula: "", resources: "Python signal examples" },
    ],
  },
  {
    id: 32,
    code: "010255401",
    nameTh: "ระบบไซเบอร์กายภาพประยุกต์",
    nameEn: "Applied Cyber-Physical System",
    credits: "3(3-0-6)",
    category: "Cyber-Physical System / Digital Twin",
    progress: 0,
    description: "CPS principles characteristics complex system design methodology data processing reasoning mechanism knowledge classification AI for cyber processing physical control practical CPS และ digital twin",
    topics: [
      { id: 32001, title: "Cyber-Physical System Principles", status: "ยังไม่เริ่ม", summary: "หลักการและลักษณะเฉพาะของระบบไซเบอร์กายภาพ", formula: "Cyber ⇄ Physical", resources: "CPS textbook" },
      { id: 32002, title: "Reasoning, AI and Physical Control", status: "ยังไม่เริ่ม", summary: "กลไกเหตุผล การจัดประเภทความรู้ AI และการควบคุมระบบกายภาพ", formula: "", resources: "AI/CPS papers" },
      { id: 32003, title: "Digital Twin", status: "ยังไม่เริ่ม", summary: "การประยุกต์ CPS และ digital twin ในภาคปฏิบัติ", formula: "Physical System ⇄ Digital Model", resources: "Digital twin case study" },
    ],
  },
  {
    id: 33,
    code: "010255402",
    nameTh: "ปัจจัยมนุษย์และการยศาสตร์ประยุกต์",
    nameEn: "Applied Human Factor and Ergonomics",
    credits: "3(3-0-6)",
    category: "Human Factors / Ergonomics",
    progress: 0,
    description: "human factor ergonomics physical ergonomics cognitive ergonomics macroergonomics human-machine interaction user interface design และ usability testing",
    topics: [
      { id: 33001, title: "Physical, Cognitive and Macroergonomics", status: "ยังไม่เริ่ม", summary: "การยศาสตร์กายภาพ การยศาสตร์การรู้คิด และการยศาสตร์มหภาค", formula: "", resources: "Ergonomics textbook" },
      { id: 33002, title: "Human-Machine Interaction", status: "ยังไม่เริ่ม", summary: "ปฏิสัมพันธ์ระหว่างมนุษย์กับเครื่องจักรและการออกแบบระบบใช้งาน", formula: "", resources: "HMI case study" },
      { id: 33003, title: "UI Design and Usability Testing", status: "ยังไม่เริ่ม", summary: "การออกแบบส่วนต่อประสานผู้ใช้และการทดสอบการใช้งาน", formula: "", resources: "UX testing guide" },
    ],
  },
  {
    id: 34,
    code: "010255403",
    nameTh: "การออกแบบนวัตกรรมและการจัดการเทคโนโลยีประยุกต์",
    nameEn: "Applied Innovation Design and Technology Management",
    credits: "3(3-0-6)",
    category: "Innovation / Technology Management",
    progress: 0,
    description: "engineering design process system/industrial design innovation design conceptualization design methodology tools knowledge-based design support และ transformation from industrial design to technology",
    topics: [
      { id: 34001, title: "Engineering and Innovation Design Process", status: "ยังไม่เริ่ม", summary: "กระบวนการออกแบบเชิงวิศวกรรมและกระบวนการออกแบบเชิงนวัตกรรม", formula: "", resources: "Design process notes" },
      { id: 34002, title: "Design Methodology and Tools", status: "ยังไม่เริ่ม", summary: "ระเบียบวิธีการออกแบบ วิธีการ และเครื่องมือสำหรับการออกแบบนวัตกรรม", formula: "", resources: "Innovation toolkit" },
      { id: 34003, title: "Technology Management and Knowledge-Based System", status: "ยังไม่เริ่ม", summary: "ระบบฐานความรู้เพื่อสนับสนุนการออกแบบและการเปลี่ยนผ่านสู่เทคโนโลยี", formula: "", resources: "Technology management case" },
    ],
  },
  {
    id: 35,
    code: "010255404",
    nameTh: "การออกแบบและพัฒนาผลิตภัณฑ์ประยุกต์",
    nameEn: "Applied Product Design and Development",
    credits: "3(3-0-6)",
    category: "Product Design / Development",
    progress: 0,
    description: "product design and development process human-centered design prototyping design optimization market analysis sustainable design practice และ industrial design",
    topics: [
      { id: 35001, title: "Product Development Process", status: "ยังไม่เริ่ม", summary: "กระบวนการออกแบบและพัฒนาผลิตภัณฑ์ตั้งแต่แนวคิดถึงต้นแบบ", formula: "", resources: "Product design textbook" },
      { id: 35002, title: "Human-centered Design and Prototyping", status: "ยังไม่เริ่ม", summary: "การออกแบบโดยคำนึงถึงมนุษย์เป็นศูนย์กลางและเทคนิคการสร้างต้นแบบ", formula: "", resources: "Prototype examples" },
      { id: 35003, title: "Optimization, Market and Sustainable Design", status: "ยังไม่เริ่ม", summary: "การออกแบบเหมาะที่สุด การวิเคราะห์ตลาด และแนวทางออกแบบยั่งยืน", formula: "", resources: "Design case study" },
    ],
  },
  {
    id: 36,
    code: "010255405",
    nameTh: "การจัดการการผลิตและการปฏิบัติการประยุกต์",
    nameEn: "Applied Production and Operations Management",
    credits: "3(3-0-6)",
    category: "Operations / Production Management",
    progress: 0,
    description: "operation strategy supply chain management demand forecast production capacity planning process management quality management และ industrial plant layout management",
    topics: [
      { id: 36001, title: "Operation Strategy and Supply Chain", status: "ยังไม่เริ่ม", summary: "กลยุทธ์การปฏิบัติการและการจัดการห่วงโซ่อุปทาน", formula: "", resources: "Operations management text" },
      { id: 36002, title: "Demand Forecast and Capacity Planning", status: "ยังไม่เริ่ม", summary: "การพยากรณ์ความต้องการและการวางแผนกำลังการผลิต", formula: "Forecast error = Actual - Forecast", resources: "Forecasting spreadsheet" },
      { id: 36003, title: "Process, Quality and Plant Layout", status: "ยังไม่เริ่ม", summary: "การจัดการกระบวนการ คุณภาพ และผังโรงงานอุตสาหกรรม", formula: "", resources: "Plant layout case" },
    ],
  },
  {
    id: 37,
    code: "010255406",
    nameTh: "การจัดการคุณภาพประยุกต์",
    nameEn: "Applied Quality Management",
    credits: "3(3-0-6)",
    category: "Quality / SPC",
    progress: 0,
    description: "quality management principles quality management system quality planning statistical process control diagnosis and elimination of variation cause และ continuous improvement strategy",
    topics: [
      { id: 37001, title: "Quality Management System", status: "ยังไม่เริ่ม", summary: "หลักการจัดการคุณภาพและระบบการจัดการคุณภาพ", formula: "", resources: "QMS notes" },
      { id: 37002, title: "Quality Planning and SPC", status: "ยังไม่เริ่ม", summary: "เทคนิคการวางแผนคุณภาพและการควบคุมกระบวนการด้วยสถิติ", formula: "Cp=(USL-LSL)/6σ", resources: "SPC handbook" },
      { id: 37003, title: "Variation Diagnosis and Continuous Improvement", status: "ยังไม่เริ่ม", summary: "การวินิจฉัยสาเหตุของความผันแปรและกลยุทธ์ปรับปรุงต่อเนื่อง", formula: "", resources: "Kaizen/Six Sigma case" },
    ],
  },
  {
    id: 38,
    code: "010255407",
    nameTh: "วิศวกรรมความปลอดภัยประยุกต์",
    nameEn: "Applied Safety Engineering",
    credits: "3(3-0-6)",
    category: "Safety Engineering",
    progress: 0,
    description: "safety engineering principles risk assessment safety management system hazard identification safety regulation safety culture safety training และ emergency response planning",
    topics: [
      { id: 38001, title: "Safety Engineering and Risk Assessment", status: "ยังไม่เริ่ม", summary: "หลักการวิศวกรรมความปลอดภัยและวิธีประเมินความเสี่ยง", formula: "Risk = Severity × Likelihood", resources: "Safety handbook" },
      { id: 38002, title: "Safety Management and Hazard Identification", status: "ยังไม่เริ่ม", summary: "ระบบจัดการความปลอดภัย การระบุอันตราย และกฎระเบียบความปลอดภัย", formula: "", resources: "Risk assessment template" },
      { id: 38003, title: "Safety Culture and Emergency Response", status: "ยังไม่เริ่ม", summary: "วัฒนธรรมความปลอดภัย การฝึกอบรม และการวางแผนรับมือเหตุฉุกเฉิน", formula: "", resources: "Emergency plan guide" },
    ],
  },
  {
    id: 39,
    code: "010255408",
    nameTh: "เรื่องคัดเฉพาะทางด้านวิศวกรรมอุตสาหการประยุกต์",
    nameEn: "Selected Topic in Applied Industrial Engineering",
    credits: "3(3-0-6)",
    category: "Selected Topic / Industrial Engineering",
    progress: 0,
    description: "การบรรยาย สัมมนา การค้นคว้าอิสระ และการศึกษาด้วยตนเองในหัวข้อที่น่าสนใจทางวิศวกรรมอุตสาหการประยุกต์",
    topics: [
      { id: 39001, title: "Selected Industrial Engineering Topic", status: "ยังไม่เริ่ม", summary: "เลือกหัวข้อวิศวกรรมอุตสาหการประยุกต์ที่สนใจเพื่อศึกษาเชิงลึก", formula: "", resources: "Research papers" },
      { id: 39002, title: "Independent Study and Seminar", status: "ยังไม่เริ่ม", summary: "การค้นคว้าอิสระ สรุปองค์ความรู้ และนำเสนอผลงานสัมมนา", formula: "", resources: "Seminar template" },
    ],
  },
];

const statusOptions = ["ยังไม่เริ่ม", "กำลังเรียน", "อ่านแล้ว", "ต้องทบทวน"];

function Badge({ children }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{children}</span>;
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-2"
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-2"
    />
  );
}

const STORAGE_KEY = "mpre-course-learning-system-v1";
const FIRESTORE_COLLECTION = "mpreLearningSystems";
const FIRESTORE_DOCUMENT_ID = "defaultUser";

// ใส่ Firebase config ของคุณตรงนี้
// วิธีเอาค่า config: Firebase Console > Project settings > Your apps > Web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF8TXmij1frmyvGxe0F8OTNBRnuZEG0",
  authDomain: "mpre-b1966.firebaseapp.com",
  projectId: "mpre-b1966",
  storageBucket: "mpre-b1966.firebasestorage.app",
  messagingSenderId: "786137271989",
  appId: "1:786137271989:web:6fa8b040f7b5a5e33738fc",
  measurementId: "G-RGERP6C8GG",
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

function createFirestoreClient() {
  if (!isFirebaseConfigured) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export default function MPRECourseLearningWebsite() {
  const [courses, setCourses] = useState(() => {
    if (typeof window === "undefined") return initialCourses;
    try {
      const savedCourses = window.localStorage.getItem(STORAGE_KEY);
      return savedCourses ? JSON.parse(savedCourses) : initialCourses;
    } catch (error) {
      console.error("Cannot load saved courses", error);
      return initialCourses;
    }
  });
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0].id);
  const [query, setQuery] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseDraft, setCourseDraft] = useState(null);
  const [topicDraft, setTopicDraft] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [syncMode, setSyncMode] = useState(isFirebaseConfigured ? "firebase" : "local");
  const firestoreDb = useMemo(() => createFirestoreClient(), []);
  const firestoreDocRef = useMemo(() => {
    if (!firestoreDb) return null;
    return doc(firestoreDb, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT_ID);
  }, [firestoreDb]);
  const hasLoadedRemoteData = useRef(false);
  const isApplyingRemoteData = useRef(false);
  const lastSavedJson = useRef("");

  useEffect(() => {
    if (!firestoreDocRef) {
      setSyncMode("local");
      return;
    }

    setSyncMode("firebase");
    setSaveStatus("saving");

    const unsubscribe = onSnapshot(
      firestoreDocRef,
      async (snapshot) => {
        try {
          if (snapshot.exists() && Array.isArray(snapshot.data()?.courses)) {
             isApplyingRemoteData.current = true;

            const remoteCourses = snapshot.data().courses;
            const remoteJson = JSON.stringify(remoteCourses);
            
            if (remoteJson !== lastSavedJson.current) {
              lastSavedJson.current = remoteJson;
              setCourses(remoteCourses);
            }
            
            setSaveStatus("saved");
            window.setTimeout(() => {
              isApplyingRemoteData.current = false;
              }, 0);
          } else if (!hasLoadedRemoteData.current) {
            await setDoc(
              firestoreDocRef,
              {
                courses: initialCourses,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
          hasLoadedRemoteData.current = true;
        } catch (error) {
          console.error("Cannot sync courses from Firebase", error);
          setSaveStatus("error");
        }
      },
      (error) => {
        console.error("Firebase realtime listener error", error);
        setSyncMode("local");
        setSaveStatus("error");
      }
    );

    return () => unsubscribe();
  }, [firestoreDocRef]);

  useEffect(() => {
    if (!hasLoadedRemoteData.current && firestoreDocRef) return;
    if (isApplyingRemoteData.current) return;
  
    const currentJson = JSON.stringify(courses);
    if (currentJson === lastSavedJson.current) return;
  
    setSaveStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        if (firestoreDocRef) {
          await setDoc(
            firestoreDocRef,
            {
              courses,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          lastSavedJson.current = currentJson;
          setSyncMode("firebase");
        } else if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
          setSyncMode("local");
        }
        setSaveStatus("saved");
      } catch (error) {
        console.error("Cannot save courses", error);
        setSaveStatus("error");
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [courses, firestoreDocRef]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || courses[0];

  const filteredCourses = useMemo(() => {
    const q = query.toLowerCase();
    return courses.filter((course) =>
      [course.code, course.nameTh, course.nameEn, course.category, course.description]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [courses, query]);

  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0);

  const getCourseStatus = (course) => {
    const topics = course.topics || [];
    if (topics.length === 0 || topics.every((topic) => topic.status === "ยังไม่เริ่ม")) {
      return "ยังไม่ได้เรียน";
    }
    if (topics.every((topic) => topic.status === "อ่านแล้ว")) {
      return "เรียนจบแล้ว";
    }
    return "เริ่มเรียน";
  };

  const dashboardStats = useMemo(() => {
    const stats = { notStarted: 0, inProgress: 0, completed: 0 };
    courses.forEach((course) => {
      const status = getCourseStatus(course);
      if (status === "ยังไม่ได้เรียน") stats.notStarted += 1;
      if (status === "เริ่มเรียน") stats.inProgress += 1;
      if (status === "เรียนจบแล้ว") stats.completed += 1;
    });
    return stats;
  }, [courses]);

const courseDashboardRows = useMemo(() => {
  return courses.map((course) => {
    const status = getCourseStatus(course);
    const readTopics = course.topics.filter((topic) => topic.status === "อ่านแล้ว").length;
    const startedTopics = course.topics.filter((topic) => topic.status !== "ยังไม่เริ่ม").length;

    const percent = course.topics.length
      ? Math.round((startedTopics / course.topics.length) * 100)
      : 0;

    return { ...course, status, readTopics, startedTopics, percent };
  });
}, [courses]);

  const addCourse = () => {
    const id = Date.now();
    const newCourse = {
      id,
      code: "NEW-CODE",
      nameTh: "รายวิชาใหม่",
      nameEn: "New Course",
      credits: "3(3-0-6)",
      category: "Uncategorized",
      progress: 0,
      description: "เพิ่มคำอธิบายรายวิชา",
      topics: [],
    };
    setCourses((prev) => [newCourse, ...prev]);
    setSelectedCourseId(id);
    setEditingCourse(true);
    setCourseDraft(newCourse);
  };

  const saveCourse = () => {
    if (!courseDraft) return;
    setCourses((prev) => prev.map((course) => (course.id === selectedCourseId ? courseDraft : course)));
    setEditingCourse(false);
    setCourseDraft(null);
  };

  const deleteCourse = () => {
    if (courses.length <= 1) return;
    const remaining = courses.filter((course) => course.id !== selectedCourseId);
    setCourses(remaining);
    setSelectedCourseId(remaining[0].id);
  };

  const startEditCourse = () => {
    setCourseDraft({ ...selectedCourse });
    setEditingCourse(true);
  };

  const addTopic = () => {
    const newTopic = {
      id: Date.now(),
      title: "หัวข้อใหม่",
      status: "ยังไม่เริ่ม",
      summary: "เพิ่มสรุปเนื้อหาสำหรับหัวข้อนี้",
      formula: "",
      resources: "",
    };
    setCourses((prev) =>
      prev.map((course) =>
        course.id === selectedCourseId ? { ...course, topics: [newTopic, ...course.topics] } : course
      )
    );
    setEditingTopicId(newTopic.id);
    setTopicDraft(newTopic);
  };

  const startEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setTopicDraft({ ...topic });
  };

  const saveTopic = () => {
    if (!topicDraft) return;
    setCourses((prev) =>
      prev.map((course) =>
        course.id === selectedCourseId
          ? { ...course, topics: course.topics.map((topic) => (topic.id === topicDraft.id ? topicDraft : topic)) }
          : course
      )
    );
    setEditingTopicId(null);
    setTopicDraft(null);
  };

  const deleteTopic = (topicId) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === selectedCourseId
          ? { ...course, topics: course.topics.filter((topic) => topic.id !== topicId) }
          : course
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white">
      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                  <GraduationCap size={18} /> MPRE Course Learning System
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isFirebaseConfigured ? "bg-emerald-400/15 text-emerald-100" : "bg-amber-400/15 text-amber-100"
                }`}>
                  {isFirebaseConfigured ? "Firebase Cloud พร้อมใช้งาน" : "ยังไม่ได้ใส่ Firebase Config: ใช้ข้อมูลเฉพาะเครื่องนี้"}
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">เว็บจัดการรายวิชาและหัวข้อการเรียนรู้</h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                เลือกรายวิชา เพิ่มหัวข้อเรียนรู้ เขียนสรุป ใส่สูตร แหล่งอ้างอิง และจัดการเนื้อหาได้แบบ เพิ่ม / แก้ไข / ลบ พร้อมบันทึกอัตโนมัติแบบเรียลไทม์ผ่าน Firebase หรือ localStorage fallback
              </p>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                saveStatus === "saved"
                  ? "bg-emerald-400/15 text-emerald-100"
                  : saveStatus === "saving"
                  ? "bg-cyan-400/15 text-cyan-100"
                  : "bg-red-400/15 text-red-100"
              }`}>
                {saveStatus === "saved" ? <Cloud size={16} /> : saveStatus === "saving" ? <Cloud size={16} /> : <CloudOff size={16} />}
                {saveStatus === "saved"
                  ? syncMode === "firebase"
                    ? "Firebase Realtime Sync: บันทึกแล้ว"
                    : "Local Realtime: บันทึกแล้ว"
                  : saveStatus === "saving"
                  ? syncMode === "firebase"
                    ? "กำลัง Sync กับ Firebase..."
                    : "กำลังบันทึกในเครื่อง..."
                  : "บันทึกไม่สำเร็จ"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setActivePage("dashboard")}
                className={`rounded-2xl px-5 py-6 font-semibold ${activePage === "dashboard" ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                <BarChart3 className="mr-2" size={18} /> Dashboard
              </Button>
              <Button
                onClick={() => setActivePage("courses")}
                className={`rounded-2xl px-5 py-6 font-semibold ${activePage === "courses" ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                <BookOpen className="mr-2" size={18} /> รายวิชา
              </Button>
              <Button onClick={addCourse} className="rounded-2xl bg-cyan-400 px-5 py-6 font-semibold text-slate-950 hover:bg-cyan-300">
                <Plus className="mr-2" size={18} /> เพิ่มรายวิชา
              </Button>
            </div>
          </div>
        </motion.header>

        {activePage === "dashboard" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <Layers className="text-cyan-300" />
                  <div><p className="text-sm text-slate-400">รายวิชาทั้งหมด</p><p className="text-3xl font-bold">{courses.length}</p></div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <Circle className="text-slate-300" />
                  <div><p className="text-sm text-slate-400">ยังไม่ได้เรียน</p><p className="text-3xl font-bold">{dashboardStats.notStarted}</p></div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <PlayCircle className="text-cyan-300" />
                  <div><p className="text-sm text-slate-400">เริ่มเรียนแล้ว</p><p className="text-3xl font-bold">{dashboardStats.inProgress}</p></div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <CheckCircle2 className="text-emerald-300" />
                  <div><p className="text-sm text-slate-400">เรียนจบแล้ว</p><p className="text-3xl font-bold">{dashboardStats.completed}</p></div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[2rem] border-white/10 bg-white/10 text-white shadow-xl backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Dashboard ภาพรวมรายวิชา</h2>
                    <p className="mt-2 text-slate-300">ดูสถานะการเรียนของทั้ง 39 รายวิชา และกดเข้าไปจัดการเนื้อหาแต่ละวิชาได้ทันที</p>
                  </div>
                  <Badge>{totalTopics} หัวข้อเรียนรู้ทั้งหมด</Badge>
                </div>

                <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
                  <div className="grid grid-cols-[110px_1fr_150px_120px_120px] bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-300">
                    <div>รหัสวิชา</div>
                    <div>รายวิชา</div>
                    <div>สถานะ</div>
                    <div>หัวข้อที่เริ่ม</div>
                    <div>ความคืบหน้า</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {courseDashboardRows.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActivePage("courses");
                          setQuery(course.code);
                          setEditingCourse(false);
                          setEditingTopicId(null);
                        }}
                        className="grid w-full grid-cols-[110px_1fr_150px_120px_120px] items-center px-4 py-4 text-left transition hover:bg-white/10"
                      >
                        <div className="font-semibold text-cyan-200">{course.code}</div>
                        <div>
                          <p className="font-semibold text-white">{course.nameTh}</p>
                          <p className="text-sm text-slate-400">{course.nameEn}</p>
                        </div>
                        <div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.status === "ยังไม่ได้เรียน"
                              ? "bg-slate-500/20 text-slate-200"
                              : course.status === "เริ่มเรียน"
                              ? "bg-cyan-400/20 text-cyan-100"
                              : "bg-emerald-400/20 text-emerald-100"
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="text-slate-300">{course.startedTopics}/{course.topics.length}</div>
                        <div>
                          <div className="mb-1 text-sm text-slate-300">{course.percent}%</div>
                          <div className="h-2 rounded-full bg-slate-700">
                            <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${course.percent}%` }} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {courseDashboardRows.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActivePage("courses");
                        setQuery(course.code);
                        setEditingCourse(false);
                        setEditingTopicId(null);
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left transition hover:bg-white/10"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-semibold text-cyan-200">{course.code}</p>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          course.status === "ยังไม่ได้เรียน"
                            ? "bg-slate-500/20 text-slate-200"
                            : course.status === "เริ่มเรียน"
                            ? "bg-cyan-400/20 text-cyan-100"
                            : "bg-emerald-400/20 text-emerald-100"
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold leading-snug text-white">{course.nameTh}</p>
                      <p className="mt-1 text-sm text-slate-400">{course.nameEn}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                        <span>เริ่มแล้ว {course.startedTopics}/{course.topics.length} หัวข้อ</span>
                        <span>{course.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-700">
                        <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${course.percent}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <Layers className="text-cyan-300" />
                  <div><p className="text-sm text-slate-400">จำนวนรายวิชา</p><p className="text-2xl font-bold">{courses.length}</p></div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <FileText className="text-cyan-300" />
                  <div><p className="text-sm text-slate-400">จำนวนหัวข้อเรียนรู้</p><p className="text-2xl font-bold">{totalTopics}</p></div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/10 text-white">
                <CardContent className="flex items-center gap-4 p-5">
                  <Clock className="text-cyan-300" />
                  <div><p className="text-sm text-slate-400">เป้าหมายระบบ</p><p className="text-2xl font-bold">เรียน / วิจัย / ทบทวน</p></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหารหัสวิชา ชื่อวิชา หรือหมวดหมู่..."
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-2"
                />
              </div>
              {query && (
                <Button onClick={() => setQuery("")} className="w-full rounded-2xl bg-white/10 text-white hover:bg-white/20">
                  แสดงรายวิชาทั้งหมด
                </Button>
              )}
            </div>

            {filteredCourses.map((course) => (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setQuery(course.code);
                  setEditingCourse(false);
                  setEditingTopicId(null);
                }}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${selectedCourseId === course.id ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-200">{course.code}</p>
                    <h2 className="mt-1 text-lg font-bold leading-snug">{course.nameTh}</h2>
                    <p className="mt-1 text-sm text-slate-400">{course.nameEn}</p>
                  </div>
                  <ChevronRight className="mt-2 text-slate-400" size={20} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{course.credits}</Badge>
                  <Badge>{course.topics.length} หัวข้อ</Badge>
                </div>
              </motion.button>
            ))}
          </aside>

          <main className="space-y-5">
            <Card className="rounded-[2rem] border-white/10 bg-white/10 text-white shadow-xl backdrop-blur">
              <CardContent className="p-6">
                {editingCourse && courseDraft ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input value={courseDraft.code} onChange={(v) => setCourseDraft({ ...courseDraft, code: v })} placeholder="รหัสวิชา" />
                      <Input value={courseDraft.credits} onChange={(v) => setCourseDraft({ ...courseDraft, credits: v })} placeholder="หน่วยกิต" />
                      <Input value={courseDraft.nameTh} onChange={(v) => setCourseDraft({ ...courseDraft, nameTh: v })} placeholder="ชื่อวิชาภาษาไทย" />
                      <Input value={courseDraft.nameEn} onChange={(v) => setCourseDraft({ ...courseDraft, nameEn: v })} placeholder="ชื่อวิชาภาษาอังกฤษ" />
                      <Input value={courseDraft.category} onChange={(v) => setCourseDraft({ ...courseDraft, category: v })} placeholder="หมวดหมู่" />
                      <Input value={String(courseDraft.progress)} onChange={(v) => setCourseDraft({ ...courseDraft, progress: Number(v) || 0 })} placeholder="Progress" />
                    </div>
                    <TextArea value={courseDraft.description} onChange={(v) => setCourseDraft({ ...courseDraft, description: v })} placeholder="คำอธิบายรายวิชา" />
                    <div className="flex gap-2">
                      <Button onClick={saveCourse} className="rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Save className="mr-2" size={16} /> บันทึกรายวิชา</Button>
                      <Button onClick={() => setEditingCourse(false)} className="rounded-2xl bg-white/10 hover:bg-white/20"><X className="mr-2" size={16} /> ยกเลิก</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-cyan-200">{selectedCourse.code} · {selectedCourse.credits}</p>
                        <h2 className="mt-1 text-3xl font-bold">{selectedCourse.nameTh}</h2>
                        <p className="mt-1 text-lg text-slate-300">{selectedCourse.nameEn}</p>
                        <p className="mt-3 max-w-3xl leading-7 text-slate-300">{selectedCourse.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={startEditCourse} className="rounded-2xl bg-white/10 hover:bg-white/20"><Edit3 className="mr-2" size={16} /> แก้ไข</Button>
                        <Button onClick={deleteCourse} className="rounded-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30"><Trash2 className="mr-2" size={16} /> ลบ</Button>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge>{selectedCourse.category}</Badge>
                      <Badge>{selectedCourse.topics.length} หัวข้อเรียนรู้</Badge>
                      <Badge>Progress {selectedCourse.progress}%</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-200">แสดงเฉพาะเนื้อหาของรายวิชาที่เลือก</p>
                <h3 className="text-2xl font-bold">หัวข้อเนื้อหาสำหรับการเรียนรู้</h3>
              </div>
              <Button onClick={addTopic} className="rounded-2xl bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
                <Plus className="mr-2" size={16} /> เพิ่มหัวข้อ
              </Button>
            </div>

            <div className="space-y-4">
              {selectedCourse.topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-visible rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur"
                >
                  {editingTopicId === topic.id && topicDraft ? (
                    <div className="space-y-3">
                      <Input value={topicDraft.title} onChange={(v) => setTopicDraft({ ...topicDraft, title: v })} placeholder="ชื่อหัวข้อ" />
                      <select
                        value={topicDraft.status}
                        onChange={(e) => setTopicDraft({ ...topicDraft, status: e.target.value })}
                        className="relative z-50 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none ring-cyan-300 focus:ring-2"
                      >
                        {statusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <TextArea value={topicDraft.summary} onChange={(v) => setTopicDraft({ ...topicDraft, summary: v })} placeholder="สรุปเนื้อหา" />
                      <Input value={topicDraft.formula} onChange={(v) => setTopicDraft({ ...topicDraft, formula: v })} placeholder="สูตร / keyword สำคัญ" />
                      <Input value={topicDraft.resources} onChange={(v) => setTopicDraft({ ...topicDraft, resources: v })} placeholder="แหล่งเรียนรู้ / link / paper" />
                      <div className="flex gap-2">
                        <Button onClick={saveTopic} className="rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Save className="mr-2" size={16} /> บันทึกหัวข้อ</Button>
                        <Button onClick={() => setEditingTopicId(null)} className="rounded-2xl bg-white/10 hover:bg-white/20"><X className="mr-2" size={16} /> ยกเลิก</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="mb-3 flex flex-wrap gap-2"><Badge>{topic.status}</Badge></div>
                          <h4 className="text-2xl font-bold">{topic.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditTopic(topic)} className="rounded-xl p-2 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-100"><Edit3 size={18} /></button>
                          <button onClick={() => deleteTopic(topic.id)} className="rounded-xl p-2 text-slate-300 hover:bg-red-500/20 hover:text-red-100"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <p className="mt-4 leading-7 text-slate-300">{topic.summary}</p>
                      {topic.formula && (
                        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200"><Sigma size={18} /> สูตร / Keyword สำคัญ</div>
                          <code className="text-cyan-50">{topic.formula}</code>
                        </div>
                      )}
                      {topic.resources && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><BookOpen size={18} /> แหล่งเรียนรู้</div>
                          <p className="text-sm text-slate-300">{topic.resources}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {selectedCourse.topics.length === 0 && (
                <div className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-400">
                  ยังไม่มีหัวข้อเรียนรู้ในรายวิชานี้ กด “เพิ่มหัวข้อ” เพื่อเริ่มสร้างเนื้อหา
                </div>
              )}
            </div>
          </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
