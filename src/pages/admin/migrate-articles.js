// Página dedicada para migrar artículos existentes a la base de datos
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container,
  Title,
  Text,
  Box,
  Group,
  Button,
  Stack,
  Alert,
  Progress,
  Badge,
  Card,
  Code,
  ScrollArea,
  Menu,
  Avatar,
  UnstyledButton,
  Breadcrumbs,
  Anchor,
  Paper
} from '@mantine/core';
import {
  IconDatabase,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconArrowLeft,
  IconUpload,
  IconLogout,
  IconChevronRight,
  IconDashboard,
  IconArticle
} from '@tabler/icons-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import LoadingScreen from '../../components/LoadingScreen';
import { useArticles } from '../../hooks/useArticles';
import { articleContents } from '../../data/articleContents';

// Mapeo de artículos existentes con sus datos de acordeón
const existingArticles = [
  {
    slug: 'vih',
    title: 'VIH - Información Completa',
    meta_description: 'Información completa sobre VIH: prevención, tratamiento, I=I, PrEP y PEP',
    meta_keywords: 'VIH, SIDA, prevención, tratamiento, indetectable, PrEP, PEP',
    content: articleContents.vih,
    sections: [
      {
        section_key: 'indetectable',
        title: 'Indetectable = Intransmisible (I=I)',
        description: 'Información sobre carga viral indetectable y su significado para la transmisión',
        content: `
          <p>Se habla de <strong>"indetectable"</strong> cuando, a partir de una correcta realización del tratamiento antirretroviral, se logra evitar la replicación del virus y se disminuye su cantidad en sangre hasta niveles que no pueden ser detectados por análisis convencionales. Alcanzar ese estado no significa haber eliminado el virus.</p>
          
          <p><strong>Cuando una persona con VIH en tratamiento mantiene una carga viral indetectable durante al menos seis meses, no existe posibilidad de transmisión del virus por vía sexual.</strong></p>
          
          <p>La estrategia de prevención combinada busca garantizar derechos universales contemplando la particularidad de cada persona, sus deseos, elecciones y situación social.</p>
          
          <p>La prevención combinada implica acciones de implementación del test rápido de VIH para un diagnóstico oportuno, la confirmación diagnóstica del virus y el acceso universal al tratamiento antirretroviral, la disponibilidad de drogas de primera línea acorde a las recomendaciones nacionales e internacionales y la accesibilidad a estudios de seguimiento que confirmen que la persona se encuentra indetectable.</p>
          
          <p><strong>Durante el año 2024 en nuestro país, 70.000 personas con VIH recibieron su medicación de parte del subsistema público de salud.</strong></p>

          <h3>Conceptos clave para tener en cuenta:</h3>
          <ul>
            <li>El tratamiento antirretroviral permite controlar en forma efectiva la infección en personas con VIH, mejorando significativamente su calidad de vida</li>
            <li>Cuando se toma todos los días, el tratamiento antirretroviral evita que el virus se replique y disminuye la cantidad de virus en la sangre hasta niveles que no pueden ser detectados por análisis convencionales. Esto se llama carga viral indetectable, y no significa haber eliminado al virus</li>
            <li>La mayoría de las personas con VIH logra tener una carga viral indetectable a los seis meses de iniciar un tratamiento antirretroviral efectivo si lo toma del modo acordado con el equipo de salud</li>
            <li><strong>Indetectable = Intransmisible (I=I)</strong> se refiere al concepto de que las personas en tratamiento antirretroviral y con carga viral indetectable por al menos seis meses no transmiten el VIH por vía sexual a otras personas VIH negativas</li>
            <li>I=I es una herramienta que permite evitar nuevas infecciones y reducir el estigma de las personas con VIH</li>
            <li>Las personas con VIH que tienen una carga viral indetectable pueden igualmente contraer y transmitir otras infecciones de transmisión sexual (ITS) como sífilis, gonorrea, clamidia o hepatitis B a través de las relaciones sexuales sin preservativo</li>
            <li>El uso correcto y consistente del preservativo en las prácticas sexuales resulta fundamental para la prevención de las ITS</li>
            <li><strong>I=I no se aplica a la transmisión por sangre o leche materna</strong></li>
          </ul>
          
          <p><strong>Importante:</strong> El concepto I=I se refiere exclusivamente a la transmisión por vía sexual: la evidencia científica actualmente disponible no permite extrapolarlo a la transmisión por vía perinatal (durante el embarazo, parto o lactancia) o por el uso de jeringas u otros materiales cortopunzantes no seguros.</p>
        `,
        order_index: 0
      },
      {
        section_key: 'prep',
        title: 'PrEP - Profilaxis Pre-exposición',
        description: 'Información sobre medicación preventiva antes de la exposición al VIH',
        content: `
          <h3>¿Qué es la PrEP?</h3>
          <p>La profilaxis Pre-exposición (PrEP, por siglas en inglés) es una de las estrategias de prevención del VIH en la cual las personas que no tienen VIH, pero que tienen prácticas que pueden exponerlos a la transmisión del virus, toman un medicamento antirretroviral y así reducen la posibilidad de adquirirlo. La PrEP está recomendada por la Organización Mundial de la Salud (OMS) como parte del abordaje de la prevención combinada junto con el preservativo.</p>

          <h3>¿Cómo funciona?</h3>
          <p>Si una persona está tomando PrEP y se expone al semen, líquido pre-seminal o fluidos vaginales de una persona con VIH, el medicamento antirretroviral ayuda a prevenir que el virus infecte las células del sistema inmunológico y así evita que se establezca la infección por VIH.</p>

          <h3>¿Previene algo más que el VIH?</h3>
          <p><strong>La PrEP NO protege de otras infecciones de transmisión sexual. Tampoco previene embarazos ni es una cura para la infección por el VIH.</strong></p>

          <h3>¿Qué medicamento se usa?</h3>
          <p>La PrEP que se utiliza actualmente consiste en la combinación de dos medicamentos en una sola pastilla. Esta combinación ya se ha aprobado en 17 países y es la que actualmente recomienda la Organización Mundial de la Salud (OMS).</p>

          <h3>¿Está disponible en Argentina?</h3>
          <p><strong>La PrEP está disponible en forma gratuita y es un derecho para todas las personas que las necesiten según la Ley 27.675.</strong> Brindar acceso a la Profilaxis Pre Exposición para el VIH es obligación de todos los subsistemas de salud (obras sociales, prepagas y hospitales y centros de salud públicos).</p>
        `,
        order_index: 1
      },
      {
        section_key: 'pep',
        title: 'PEP - Profilaxis Post-exposición',
        description: 'Información sobre medicación de emergencia después de una exposición de riesgo',
        content: `
          <p>Si en una relación sexual el preservativo se rompe, sale, desliza o no se usa, podés pedir la PEP (Profilaxis post exposición, se le dice PEP por sus siglas en inglés).</p>
          
          <p>La PEP es el uso de medicamentos para reducir el riesgo de adquirir VIH y otras ITS. En el caso del VIH se deben administrar antirretrovirales dentro de las 72 hs de la situación de riesgo y tomar por 28 días. <strong>Recordá que te tienen que brindar el tratamiento completo para que sea efectivo.</strong></p>
          
          <p>Además, las personas con capacidad de gestar también deben tomar la "pastilla del día después" (anticoncepción hormonal de emergencia). Tiene mayor efectividad dentro de las siguientes 12 hs a la relación sexual sin protección, aunque se puede tomar hasta 72 horas después. De todos modos, lo recomendable es que no esperes hasta el día después para conseguirla y tomarla.</p>

          <h3>¿Qué tenés que hacer si tuviste una situación de riesgo?</h3>
          <p>Acercate a la guardia más cercana o al servicio que tengas disponible según tu cobertura de salud, y consultá por la PEP. En la consulta, un profesional evaluará la situación y te indicará cómo seguir.</p>

          <h4>Para VIH:</h4>
          <p>Este tratamiento reduce en forma significativa la transmisión del VIH. Es un régimen de medicación que dura 28 días y que debe proporcionarse en las primeras 72 horas luego de la situación de riesgo, aunque es menos eficaz con cada hora que pasa.</p>

          <h4>Otras ITS:</h4>
          <p>Se debe considerar Clamidiasis, Sífilis, Gonorrea, Tricomoniasis, Hepatitis B, Condilomatosis.</p>

          <h4>Embarazo:</h4>
          <p>En el caso de personas con capacidad de gestar, si el preservativo era el único método anticonceptivo que estaban utilizando, es recomendable acceder a la anticoncepción hormonal de emergencia (pastilla del día después).</p>

          <h3>¿Hay que pagar algo?</h3>
          <p><strong>No, todas las prepagas, obras sociales y guardias del sistema público deben brindarla gratis, inmediatamente y de forma confidencial.</strong></p>
          
          <p>La PEP es tu derecho según la Ley 27.675 de Respuesta Integral al VIH, Hepatitis virales, Tuberculosis e ITS.</p>
        `,
        order_index: 2
      },
      {
        section_key: 'vacunacion',
        title: 'Vacunación para Personas con VIH',
        description: 'Esquemas especiales de vacunación para personas con VIH',
        content: `
          <p>Las personas con VIH tienen un riesgo incrementado de contraer determinadas infecciones y sufrir complicaciones graves. Estas infecciones se denominan oportunistas porque "aprovechan" que el sistema inmunológico está debilitado por el virus del VIH para atacar.</p>
          
          <p>Por ello, <strong>la prevención mediante vacunas constituye una herramienta clave para evitar estas complicaciones.</strong></p>

          <h3>¿Qué vacunas están indicadas?</h3>
          <p>Las vacunas deben administrarse según las recomendaciones habituales para la población general, pero también existen esquemas especiales para personas con VIH según el estado inmunológico (recuento de CD4), la carga viral y la edad.</p>

          <h4>Vacunas recomendadas especialmente:</h4>
          <ul>
            <li><strong>Vacuna contra la influenza (gripe):</strong> Anual, con vacuna inactivada</li>
            <li><strong>Vacuna antineumocócica:</strong> Para prevenir infecciones por neumococo</li>
            <li><strong>Vacuna contra hepatitis A y B:</strong> Si no hay inmunidad previa</li>
            <li><strong>Vacuna contra el VPH:</strong> Hasta los 26 años, independientemente del sexo</li>
            <li><strong>Vacuna COVID-19:</strong> Esquema completo según recomendaciones vigentes</li>
            <li><strong>Vacuna antimeningocócica:</strong> Según factores de riesgo</li>
          </ul>

          <h3>Consideraciones importantes</h3>
          <ul>
            <li><strong>Vacunas con virus vivos:</strong> Generalmente contraindicadas si CD4 &lt; 200 células/mm³</li>
            <li><strong>Momento óptimo:</strong> Mejor respuesta inmune cuando CD4 &gt; 200 células/mm³</li>
            <li><strong>Dosis adicionales:</strong> Pueden ser necesarias para lograr protección adecuada</li>
            <li><strong>Seguimiento:</strong> Control serológico para verificar respuesta inmune</li>
          </ul>

          <h3>Esquema especial COVID-19</h3>
          <p>Las personas con VIH deben recibir el esquema completo de vacunación COVID-19, incluyendo dosis de refuerzo según las recomendaciones del Ministerio de Salud.</p>

          <h3>¿Dónde vacunarse?</h3>
          <p>Podés vacunarte en:</p>
          <ul>
            <li>Vacunatorios públicos</li>
            <li>Tu obra social o prepaga</li>
            <li>Hospitales especializados en VIH</li>
            <li>Consultorios de infectología</li>
          </ul>

          <p><strong>Importante:</strong> Siempre consultá con tu médico infectólogo sobre el esquema de vacunación más adecuado según tu situación particular.</p>

          <p>Las vacunas son gratuitas en el sistema público de salud y están cubiertas por obras sociales y prepagas según el Programa Nacional de Inmunizaciones.</p>
        `,
        order_index: 3
      }
    ]
  },
  {
    slug: 'its',
    title: 'ITS - Infecciones de Transmisión Sexual',
    meta_description: 'Información completa sobre ITS: síntomas, prevención, diagnóstico y tratamiento',
    meta_keywords: 'ITS, infecciones transmisión sexual, sífilis, gonorrea, clamidia, herpes, VPH, hepatitis',
    content: articleContents.its,
    sections: [
      {
        section_key: 'sifilis',
        title: 'Sífilis',
        description: 'Información completa sobre sífilis: síntomas, transmisión y tratamiento',
        content: `
          <h3>¿Qué es?</h3>
          <p>La sífilis es una infección de transmisión sexual (ITS) causada por la bacteria Treponema pallidum. Si no se trata, puede permanecer durante años y causar daño grave a distintos órganos.</p>
          
          <h3>¿Cómo se transmite?</h3>
          <p>A través de relaciones sexuales sin protección (vaginal, anal u oral) con una persona con lesiones activas (chancro). También puede transmitirse durante el embarazo o el parto (sífilis congénita). Es posible reinfectarse tras haberla padecido.</p>
          
          <h3>¿Cuáles son los síntomas?</h3>
          <p><strong>Sífilis primaria:</strong> Se manifiesta generalmente por la presencia de una llaga (chancro), que suele ser única e indolora. El chancro primario puede pasar desapercibido, sobre todo en personas con vagina. Si notás una llaga, herida o lastimadura que no duele, aunque parezca menor, consultá rápido al centro de salud.</p>
          
          <p><strong>Sífilis secundaria:</strong> Erupciones en la piel, fiebre y ganglios inflamados.</p>
          
          <p><strong>Latente:</strong> Sin síntomas, pero la bacteria sigue presente.</p>
          
          <p><strong>Terciaria:</strong> Puede causar daño neurológico, cardiovascular o lesiones en órganos, incluso décadas después.</p>
          
          <p><em>En muchos casos no hay síntomas visibles.</em></p>
          
          <p><strong>Sífilis congénita:</strong> Se transmite durante el embarazo. Puede causar aborto, muerte fetal, parto prematuro, bajo peso al nacer, malformaciones o daño en órganos y sistema nervioso. Algunos recién nacidos no presentan síntomas al nacer.</p>
          
          <h3>¿Cómo se diagnóstica?</h3>
          <p>Se basa en el examen físico y pruebas de laboratorio:</p>
          <ul>
            <li><strong>No treponémicas:</strong> Determinan infección activa o pasada, pero no confirman sífilis.</li>
            <li><strong>Treponémicas:</strong> Pruebas rápidas o de laboratorio que confirman infección, aunque no distinguen si está activa.</li>
          </ul>
          <p>Se recomienda combinar ambas.</p>
          
          <h3>¿Cómo se trata?</h3>
          <ul>
            <li>La sífilis se cura con penicilina benzatínica, el antibiótico de elección.</li>
            <li>En personas gestantes, la penicilina es el único tratamiento eficaz para prevenir la sífilis congénita.</li>
            <li>En personas alérgicas se pueden usar alternativas (doxiciclina, ceftriaxona), o desensibilización a la penicilina bajo control médico.</li>
            <li>El tratamiento oportuno durante el embarazo evita la transmisión al bebé.</li>
          </ul>
          
          <h3>¿Cómo se previene?</h3>
          <ul>
            <li>Uso correcto del preservativo en todas las relaciones sexuales.</li>
            <li>Detección y tratamiento temprano durante el embarazo para prevenir sífilis congénita.</li>
            <li>Control y seguimiento médico después del tratamiento.</li>
            <li>Diagnóstico y tratamiento a la/s pareja/s sexual/es.</li>
          </ul>
        `,
        order_index: 0
      },
      {
        section_key: 'hepatitis',
        title: 'Hepatitis (A, B, C)',
        description: 'Información sobre hepatitis A, B y C: transmisión, síntomas y prevención',
        content: `
          <p>La hepatitis es la inflamación del hígado, el órgano que procesa los nutrientes, sintetiza las proteínas y cumple una función desintoxicante. Cuando una persona contrae hepatitis, el hígado altera su funcionamiento. En la mayoría de los casos, es producida por un virus. En otros casos, puede producirse por el consumo excesivo de alcohol o por algunas toxinas, medicamentos o determinadas afecciones médicas.</p>
          
          <p>En general, las hepatitis no producen síntomas. Por lo tanto, sólo se las puede diagnosticar mediante análisis de sangre. Existen varios tipos de hepatitis virales, de acuerdo al tipo de virus con el que la persona se infecte. Los más comunes son hepatitis A, hepatitis B y hepatitis C.</p>
          
          <p><strong>Las hepatitis A y B cuentan con vacuna, incluidas en el Calendario Nacional de Vacunación.</strong></p>
        `,
        order_index: 1
      },
      {
        section_key: 'vph',
        title: 'VPH (Virus del Papiloma Humano)',
        description: 'Información sobre VPH: tipos, síntomas, diagnóstico y prevención',
        content: `
          <h3>¿Qué es?</h3>
          <p>El VPH es un virus que puede afectar la piel y las mucosas, incluyendo la zona genital, anal y la boca. Existen más de 200 tipos, pero solo alrededor de 40 afectan la zona genital. Se clasifican en:</p>
          <ul>
            <li><strong>VPH de bajo riesgo:</strong> Causan verrugas genitales o anales. No provocan cáncer.</li>
            <li><strong>VPH de alto riesgo:</strong> Pueden generar cambios en las células que, con el tiempo, pueden convertirse en cáncer, principalmente cáncer de cuello uterino. También se asocian, aunque menos frecuentemente, a cáncer de pene, ano, boca y garganta.</li>
          </ul>
          
          <h3>¿Cómo se transmite?</h3>
          <p>Se transmite por contacto piel con piel durante relaciones sexuales.</p>
          <p><strong>Es muy común:</strong> se estima que el 80% de las personas lo contraerán en algún momento de su vida. Tanto mujeres como varones pueden infectarse y transmitir el virus.</p>
        `,
        order_index: 2
      },
      {
        section_key: 'herpes',
        title: 'Herpes Genital',
        description: 'Información sobre herpes genital: transmisión, síntomas y tratamiento',
        content: `
          <p>El herpes es una infección de transmisión sexual (ITS) muy frecuente. Está causada por un virus que puede afectar la boca, los genitales o el ano. La mayoría de las personas no tiene síntomas, pero igual puede transmitirlo. Cuando aparecen, suelen verse vesículas (ampollas muy pequeñas) o llagas dolorosas que pueden picar o arder. Después desaparecen, pero el virus queda en el cuerpo y puede volver a activarse más adelante.</p>
          
          <h3>TRANSMISIÓN</h3>
          <ul>
            <li>Por contacto directo con una lesión o con saliva (en el caso del herpes oral).</li>
            <li>Al tener relaciones sexuales sin preservativo (sexo vaginal, anal u oral).</li>
            <li>De una persona embarazada al bebé durante el parto.</li>
          </ul>
        `,
        order_index: 3
      },
      {
        section_key: 'gonorrea',
        title: 'Gonorrea',
        description: 'Información sobre gonorrea: síntomas, diagnóstico y tratamiento',
        content: `
          <h3>¿Qué es?</h3>
          <p>La gonorrea es una infección de transmisión sexual (ITS) causada por la bacteria Neisseria gonorrhoeae. Puede provocar infecciones en la uretra, cuello del útero, recto y garganta. Puede cursar de manera asintomática generando problemas de salud grave si no se la trata.</p>
          
          <h3>¿Cómo se transmite?</h3>
          <p>Se transmite a través de relaciones sexuales vaginales, anales u orales sin preservativo con una persona infectada. También puede pasar de madre a hijo durante el parto. Es posible reinfectarse aunque ya se haya tenido antes.</p>
        `,
        order_index: 4
      },
      {
        section_key: 'clamidia',
        title: 'Clamidia',
        description: 'Información sobre clamidia: síntomas, prevención y tratamiento',
        content: `
          <h3>¿Qué es?</h3>
          <p>La infección por Chlamydia trachomatis es la infección de transmisión sexual (ITS) bacteriana más frecuente a nivel mundial. Puede comprometer el pene, la vagina, el cuello uterino, la uretra, el ano, la garganta y los ojos. Generalmente, cursa sin síntomas.</p>
          
          <h3>¿Cómo se transmite?</h3>
          <p>Se transmite a través de relaciones sexuales sin preservativo (vaginales, anales o, en menor medida, orales) con una persona infectada. También puede transmitirse de una persona embarazada a su bebé durante el parto. El contacto genital de piel con piel y el contacto ocular con secreciones infectadas son vías posibles de contagio.</p>
        `,
        order_index: 5
      },
      {
        section_key: 'tricomoniasis',
        title: 'Tricomoniasis',
        description: 'Información sobre tricomoniasis: síntomas y tratamiento',
        content: `
          <p>Infección causada por el parásito Trichomonas vaginalis, transmitida por relaciones sexuales sin protección.</p>
          
          <h3>¿Cuáles son los síntomas?</h3>
          <p>Flujo vaginal espumoso y amarillento, picazón, ardor, dolor al orinar o durante el sexo.</p>

          <h3>¿Cómo se trata?</h3>
          <p>Debe ser indicado por un profesional de la salud. El tratamiento es sencillo y eficaz con medicamentos antiparasitarios. Tratar a todas las parejas sexuales al mismo tiempo, aunque no presenten síntomas.</p>
        `,
        order_index: 6
      }
    ]
  },
  {
    slug: 'apoyo-vih',
    title: 'Si tenés VIH, te acompañamos',
    meta_description: 'Apoyo y recursos para personas con VIH del Municipio de Comodoro Rivadavia',
    meta_keywords: 'VIH, apoyo, recursos, acompañamiento, tratamiento, salud',
    content: articleContents.apoyoVih,
    sections: []
  },
  {
    slug: 'conoce-tus-derechos',
    title: 'Conoce Tus Derechos',
    meta_description: 'Información sobre tus derechos en salud sexual y reproductiva',
    meta_keywords: 'derechos, salud sexual, marco legal, ley, derechos sexuales',
    content: articleContents.marcoLegal,
    sections: []
  },
  {
    slug: 'embarazo-lactancia',
    title: 'Embarazo y Lactancia',
    meta_description: 'Información esencial sobre cuidados durante el embarazo y la lactancia',
    meta_keywords: 'embarazo, lactancia, cuidados prenatales, salud materna',
    content: articleContents.embarazoLactancia,
    sections: []
  },
  {
    slug: 'preservativos',
    title: 'Preservativos',
    meta_description: 'Información completa sobre preservativos: uso correcto y tipos disponibles',
    meta_keywords: 'preservativos, preservativo peneano, preservativo vaginal, anticoncepción, prevención',
    content: articleContents.preservativos,
    sections: [
      {
        section_key: 'preservativo-peneano',
        title: 'Preservativo Peneano',
        description: 'Uso correcto y consejos importantes',
        content: `
          <h3>Uso correcto del preservativo peneano</h3>
          <p>El preservativo es la única barrera que evita la transmisión sexual del VIH y otras infecciones de transmisión sexual. Para usarlo correctamente es necesario:</p>
          
          <h4>Comprobar que tenga aire y no esté vencido</h4>
          <p>Todos los preservativos tienen fecha de vencimiento y es importante chequearlos antes de usarlos. También, que el sobrecito contenga aire para comprobar que no esté deteriorado.</p>
          
          <h4>Poner el preservativo una vez que el pene esté completamente erecto</h4>
          <p>De este modo el preservativo se mantiene en su lugar durante toda la relación sexual.</p>
          
          <h4>Sacar el aire de la punta</h4>
          <p>Antes de desenrollarlo y una vez que está apoyado sobre el pene erecto, se recomienda apretar la punta para sacar el aire. Esto evitará que se derrame semen.</p>
          
          <h4>El preservativo se debe desenrollar fácilmente</h4>
          <p>Si no se puede desenrollar hasta la base del pene, es porque se colocó del lado equivocado. En este caso, hay que tirar el preservativo y empezar con uno nuevo.</p>
          
          <h4>Usarlo de principio a fin</h4>
          <p>Esto incluye juegos previos, sexo oral y quiere decir que se usa desde la erección hasta después de la eyaculación.</p>
          
          <h4>No esperar para sacar el preservativo</h4>
          <p>Se recomienda hacerlo una vez que se haya eyaculado y antes de perder la erección para evitar que el semen se derrame.</p>
          
          <h4>Hacer un nudo y tirar a la basura</h4>
          <p>El preservativo no debe tirarse al inodoro para evitar taparlo.</p>

          <h3>Consejos útiles sobre el uso del preservativo</h3>
          <ul>
            <li><strong>Evitar aceites que no estén diseñados para relaciones sexuales:</strong> Se deben usar sólo lubricantes a base de silicona o agua, no a base de aceite ya que pueden dañar el látex.</li>
            <li><strong>No es necesario incluir espermicidas:</strong> El uso correcto del preservativo es efectivo por sí mismo.</li>
            <li><strong>Nunca usar dos preservativos al mismo tiempo:</strong> Usar un preservativo sobre otro puede provocar roturas.</li>
            <li><strong>Cambiar de preservativo luego de cada tipo de relación:</strong> Usar uno nuevo si se tiene sexo oral, vaginal y anal.</li>
            <li><strong>Usar el talle adecuado:</strong> Si se siente demasiado apretado o no llega a la base del pene, probablemente no sea el talle adecuado.</li>
          </ul>

          <h3>Recordá</h3>
          <p><strong>El preservativo es responsabilidad compartida:</strong> Todas las personas que accedan a tener relaciones sexuales pueden obtener preservativos, proponer usarlos y colocarlos.</p>
          <p><strong>Es necesario usar preservativo si sos usuario de Profilaxis Pre Exposición (PrEP):</strong> Si estás tomando PrEP para VIH, es necesario usar preservativo peneano o vaginal en las prácticas sexuales para prevenir otras Infecciones de Transmisión Sexual (ITS) y evitar embarazos no intencionales.</p>
        `,
        order_index: 0
      },
      {
        section_key: 'preservativo-vaginal',
        title: 'Preservativo Vaginal',
        description: 'Características, uso y preguntas frecuentes',
        content: `
          <h3>¿Qué es el preservativo vaginal?</h3>
          <p>El preservativo vaginal es un método de barrera que se utiliza en prácticas sexuales de penetración, ya sea con pene, dildo y otros juguetes sexuales.</p>
          <p>Cuando es utilizado correctamente, tiene una efectividad mayor al 95% para evitar la transmisión del VIH y otras infecciones de transmisión sexual (ITS) como la sífilis, y reduce la posibilidad de embarazos no intencionales.</p>
          
          <p><strong>Características:</strong></p>
          <ul>
            <li>Mide aproximadamente 17 cm (similar al preservativo peneano)</li>
            <li>Está hecho de nitrilo, un material apto para personas alérgicas al látex</li>
            <li>Viene lubricado a base de silicona</li>
            <li>Tiene un anillo externo que es más ancho en el extremo abierto</li>
            <li>Tiene un anillo interno que es flexible</li>
            <li>Permite mayor autonomía en las prácticas sexuales de las personas con vagina</li>
          </ul>

          <h3>¿Cómo se usa el preservativo vaginal?</h3>
          <ol>
            <li>Antes de abrirlo, revisar que el envase no esté roto o dañado y verificar la fecha de vencimiento</li>
            <li>Sin abrirlo, frotar el paquete entre las manos limpias, para esparcir el lubricante en el interior</li>
            <li>Abrir empezando desde la flecha o ranura situada en el borde (no utilices tijeras ni dientes) y sacar el preservativo</li>
            <li>Para colocar el preservativo vaginal, busca una posición que te resulte cómoda</li>
            <li>Agarrar el anillo interno (extremo cerrado) entre el pulgar y el índice. Luego, apretarlo por los lados hasta que se junten y formen una punta</li>
            <li>Separar los labios externos de la vulva y usar la punta formada por la unión de los lados para empujar el PV hacia adentro</li>
            <li>Deslizar los dedos dentro del preservativo y empujar el anillo interior, que ya está dentro de la vagina, hasta donde sea posible</li>
            <li>El preservativo vaginal tiene que ajustarse a la pared de la vagina sin retorcerse. Sostener el anillo exterior al inicio de la penetración</li>
            <li>Para retirar el preservativo vaginal agarrar el anillo exterior y girarlo para extraerlo</li>
          </ol>

          <h3>Preguntas frecuentes sobre el preservativo vaginal</h3>
          
          <h4>¿Cuál es la efectividad del preservativo vaginal?</h4>
          <p>Utilizado correctamente tiene una efectividad del 95% para prevenir embarazos, y mayor efectividad para prevenir el VIH y las ITS, similar al preservativo peneano.</p>

          <h4>¿Se puede combinar con otros métodos anticonceptivos?</h4>
          <p>Se puede combinar con pastillas anticonceptivas, dispositivos intrauterinos (DIU y SIU), anticoncepción inyectable e implantes. No se recomienda usar de forma simultánea con el preservativo peneano para evitar que se rompan con la fricción.</p>

          <h4>¿Se puede utilizar durante la menstruación?</h4>
          <p>Se puede usar el preservativo vaginal durante la menstruación. Si usas productos de contención menstrual como copitas o tampones, retirarlos previo a su colocación.</p>

          <h4>¿Quiénes pueden utilizarlo?</h4>
          <p>Pueden usarlo todas las personas con vagina. Se puede usar en situaciones de posparto, posaborto o poscesárea reciente.</p>
          <p>No está recomendado para personas con neovagina o histerectomizadas por no poder ajustarse al cuello del útero.</p>
        `,
        order_index: 1
      }
    ]
  },
  {
    slug: 'testeos',
    title: 'Testeos',
    meta_description: 'Información sobre testeos y estudios de salud sexual',
    meta_keywords: 'testeos, VIH, ITS, análisis, estudios, diagnóstico',
    content: articleContents.testeos,
    sections: []
  },
  {
    slug: 'vacunacion',
    title: 'Vacunación y Prevención',
    meta_description: 'Información sobre vacunación y prevención de enfermedades de transmisión sexual',
    meta_keywords: 'vacunación, prevención, VPH, hepatitis, vacunas, inmunización',
    content: articleContents.vacunacion,
    sections: []
  }
];

export default function MigrateArticlesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const { createArticle } = useArticles();

  // Verificar autenticación con NextAuth
  React.useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user) {
      if (session.user.role !== 1 && session.user.role !== 2) {
        router.push("/login?error=insufficient_permissions");
        return;
      }
      setLoading(false);
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === existingArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(existingArticles.map(article => article.slug));
    }
  };

  const toggleArticleSelection = (slug) => {
    setSelectedArticles(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const migrateArticles = async () => {
    setMigrating(true);
    setProgress(0);
    setResults([]);

    const articlesToMigrate = existingArticles.filter(article => 
      selectedArticles.includes(article.slug)
    );

    for (let i = 0; i < articlesToMigrate.length; i++) {
      const article = articlesToMigrate[i];
      
      try {
        const articleData = {
          slug: article.slug,
          title: article.title,
          meta_description: article.meta_description,
          meta_keywords: article.meta_keywords,
          content: article.content,
          status: 'published',
          sections: article.sections
        };

        await createArticle(articleData);
        
        setResults(prev => [...prev, {
          slug: article.slug,
          title: article.title,
          status: 'success',
          message: 'Migrado exitosamente'
        }]);
        
      } catch (error) {
        console.error(`Error migrando ${article.slug}:`, error);
        setResults(prev => [...prev, {
          slug: article.slug,
          title: article.title,
          status: 'error',
          message: error.message || 'Error desconocido'
        }]);
      }
      
      setProgress(((i + 1) / articlesToMigrate.length) * 100);
    }

    setMigrating(false);
  };

  const resetMigration = () => {
    setProgress(0);
    setResults([]);
    setSelectedArticles([]);
  };

  if (status === "loading" || loading) {
    return (
      <LoadingScreen
        message="Verificando autenticación..."
        backHref="/login"
        backText="Volver al login"
      />
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Migrar Artículos - Panel Administrativo</title>
        <meta name="description" content="Migrar artículos existentes a la base de datos" />
      </Head>

      {/* Header */}
      <Box bg="white" style={{ borderBottom: "1px solid #e9ecef" }}>
        <Container size="xl">
          <Group h={70} justify="space-between">
            <Group>
              <IconDatabase size={28} color="#1B436B" />
              <div>
                <Text fw={700} size="lg" c="brand.5">
                  Migrar Artículos
                </Text>
                <Text size="sm" c="dimmed">
                  Importar contenido existente a la base de datos
                </Text>
              </div>
            </Group>

            <Group>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap={7}>
                      <Avatar
                        size={36}
                        radius="xl"
                        color="brand"
                        variant="filled"
                      >
                        {session.user.name
                          ? session.user.name.charAt(0).toUpperCase()
                          : "U"}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {session.user.name} ({session.user.roleName})
                        </Text>
                        <Text size="xs" c="dimmed">
                          {session.user.email}
                        </Text>
                      </Box>
                      <IconChevronRight size={14} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconDashboard size={14} />}
                    component={Link}
                    href="/admin/dashboard"
                  >
                    Tablero
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconArticle size={14} />}
                    component={Link}
                    href="/admin/articles"
                  >
                    Gestión de Artículos
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Breadcrumbs */}
      <Box bg="gray.0" py="sm">
        <Container size="xl">
          <Breadcrumbs>
            <Anchor component={Link} href="/admin/dashboard" c="brand.5">
              Tablero
            </Anchor>
            <Anchor component={Link} href="/admin/articles" c="brand.5">
              Artículos
            </Anchor>
            <Text c="dimmed">Migrar</Text>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container
        size="xl"
        py="xl"
        style={{ backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 120px)" }}
      >
        <Stack gap="xl">
          {/* Información */}
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            <Text size="sm">
              Esta herramienta te permite migrar los artículos existentes de archivos estáticos 
              a la base de datos dinámica. Selecciona los artículos que deseas migrar y haz clic en 
              &quot;Migrar Artículos&quot; para comenzar el proceso.
            </Text>
          </Alert>

          <Paper withBorder p="lg" style={{ backgroundColor: 'white' }}>
            {results.length === 0 && (
              <>
                <Group justify="space-between" mb="lg">
                  <Title order={3}>Artículos disponibles para migrar</Title>
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={handleSelectAll}
                  >
                    {selectedArticles.length === existingArticles.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </Button>
                </Group>

                <ScrollArea h={400}>
                  <Stack gap="sm">
                    {existingArticles.map((article) => (
                      <Card 
                        key={article.slug} 
                        withBorder 
                        p="md"
                        style={{ 
                          cursor: 'pointer',
                          border: selectedArticles.includes(article.slug) 
                            ? '2px solid #228be6' 
                            : '1px solid #e9ecef'
                        }}
                        onClick={() => toggleArticleSelection(article.slug)}
                      >
                        <Group justify="space-between">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="xs">
                              <Text fw={500}>{article.title}</Text>
                              <Code size="sm">{article.slug}</Code>
                              {article.sections.length > 0 && (
                                <Badge size="sm" variant="light" color="blue">
                                  {article.sections.length} secciones
                                </Badge>
                              )}
                            </Group>
                            <Text size="sm" c="dimmed" lineClamp={2}>
                              {article.meta_description}
                            </Text>
                          </Stack>
                          {selectedArticles.includes(article.slug) && (
                            <IconCheck size={24} color="#228be6" />
                          )}
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              </>
            )}

            {migrating && (
              <Stack gap="md" align="center">
                <Title order={4}>Migrando artículos...</Title>
                <Progress value={progress} color="blue" w="100%" size="lg" />
                <Text size="sm" c="dimmed">
                  {Math.round(progress)}% completado
                </Text>
              </Stack>
            )}

            {results.length > 0 && (
              <Stack gap="md">
                <Title order={4}>Resultados de la migración</Title>
                <ScrollArea h={300}>
                  <Stack gap="sm">
                    {results.map((result, index) => (
                      <Group key={index} justify="space-between" p="sm" style={{ 
                        border: '1px solid #e9ecef', 
                        borderRadius: '8px',
                        backgroundColor: result.status === 'success' ? '#f0f9ff' : '#fef2f2'
                      }}>
                        <Text fw={500}>{result.title}</Text>
                        <Group gap="xs">
                          {result.status === 'success' ? (
                            <IconCheck size={20} color="green" />
                          ) : (
                            <IconX size={20} color="red" />
                          )}
                          <Text 
                            size="sm" 
                            c={result.status === 'success' ? 'green' : 'red'}
                          >
                            {result.message}
                          </Text>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            )}

            <Group justify="space-between" mt="xl">
              <Button
                component={Link}
                href="/admin/articles"
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
              >
                Volver a Artículos
              </Button>

              {results.length > 0 ? (
                <Group>
                  <Button variant="light" onClick={resetMigration}>
                    Migrar Más Artículos
                  </Button>
                  <Button 
                    component={Link}
                    href="/admin/articles"
                    color="blue"
                  >
                    Ver Artículos Migrados
                  </Button>
                </Group>
              ) : (
                <Button 
                  leftSection={<IconUpload size={16} />}
                  onClick={migrateArticles}
                  disabled={selectedArticles.length === 0 || migrating}
                  loading={migrating}
                  color="green"
                  size="md"
                >
                  Migrar {selectedArticles.length} Artículo{selectedArticles.length !== 1 ? 's' : ''}
                </Button>
              )}
            </Group>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}