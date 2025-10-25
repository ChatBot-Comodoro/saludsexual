// Componente para migrar artículos existentes a la base de datos
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Text,
  Group,
  Alert,
  Progress,
  Badge,
  Card,
  Title,
  Accordion,
  Code,
  ScrollArea
} from '@mantine/core';
import {
  IconUpload,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconDatabase
} from '@tabler/icons-react';
import { useArticles } from '../../hooks/useArticles';
import { articleContents } from '../../data/articleContents';

// Mapeo de artículos existentes con sus datos de acordeón
const existingArticles = [
  {
    slug: 'hepatitis',
    title: 'Hepatitis',
    meta_description: 'Información completa sobre hepatitis: tipos, síntomas, prevención y tratamiento',
    meta_keywords: 'hepatitis, hígado, hepatitis A, hepatitis B, hepatitis C, vacuna, prevención',
    content: articleContents.hepatitis,
    sections: []
  },
  {
    slug: 'anticonceptivos',
    title: 'Métodos Anticonceptivos',
    meta_description: 'Guía completa de métodos anticonceptivos y planificación familiar',
    meta_keywords: 'anticonceptivos, planificación familiar, preservativo, pastillas, DIU',
    content: articleContents.anticonceptivos,
    sections: []
  },
  {
    slug: 'prep',
    title: 'PrEP - Profilaxis Pre-exposición',
    meta_description: 'Información sobre PrEP: qué es, cómo funciona y cómo acceder en Argentina',
    meta_keywords: 'PrEP, profilaxis pre-exposición, VIH, prevención, medicamento',
    content: articleContents.prep,
    sections: []
  },
  {
    slug: 'embarazo',
    title: 'Embarazo y Salud Sexual',
    meta_description: 'Información sobre embarazo, cuidados prenatales y salud sexual',
    meta_keywords: 'embarazo, prenatal, salud sexual, cuidados, maternidad',
    content: articleContents.embarazo,
    sections: []
  },
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
      }
    ]
  },
  // Puedes agregar más artículos aquí...
];

export default function ArticleMigrator({ opened, onClose }) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const { createArticle } = useArticles();

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
        // Crear el artículo principal
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
      
      // Actualizar progreso
      setProgress(((i + 1) / articlesToMigrate.length) * 100);
    }

    setMigrating(false);
  };

  const resetMigration = () => {
    setProgress(0);
    setResults([]);
    setSelectedArticles([]);
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="xl" 
      title={
        <Group>
          <IconDatabase size={20} />
          <Title order={3}>Migrar Artículos Existentes</Title>
        </Group>
      }
      zIndex={2000}
      overlayProps={{ 
        backgroundOpacity: 0.55, 
        blur: 3,
        style: { zIndex: 1999 }
      }}
      styles={{
        modal: {
          zIndex: 2000,
        },
        overlay: {
          zIndex: 1999,
        }
      }}
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          <Text size="sm">
            Esta herramienta te permite migrar los artículos existentes de archivos estáticos 
            a la base de datos dinámica. Selecciona los artículos que deseas migrar.
          </Text>
        </Alert>

        {results.length === 0 && (
          <>
            <Group justify="space-between">
              <Text fw={500}>Artículos disponibles para migrar:</Text>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleSelectAll}
              >
                {selectedArticles.length === existingArticles.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </Button>
            </Group>

            <ScrollArea h={300}>
              <Stack gap="xs">
                {existingArticles.map((article) => (
                  <Card 
                    key={article.slug} 
                    withBorder 
                    p="sm"
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
                          <Text fw={500} size="sm">{article.title}</Text>
                          <Code size="xs">{article.slug}</Code>
                          {article.sections.length > 0 && (
                            <Badge size="xs" variant="light" color="blue">
                              {article.sections.length} secciones
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {article.meta_description}
                        </Text>
                      </Stack>
                      {selectedArticles.includes(article.slug) && (
                        <IconCheck size={20} color="#228be6" />
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </>
        )}

        {migrating && (
          <Stack gap="xs">
            <Text size="sm">Migrando artículos...</Text>
            <Progress value={progress} color="blue" />
            <Text size="xs" c="dimmed">
              {Math.round(progress)}% completado
            </Text>
          </Stack>
        )}

        {results.length > 0 && (
          <Stack gap="xs">
            <Text fw={500}>Resultados de la migración:</Text>
            <ScrollArea h={200}>
              <Stack gap="xs">
                {results.map((result, index) => (
                  <Group key={index} justify="space-between">
                    <Text size="sm">{result.title}</Text>
                    <Group gap="xs">
                      {result.status === 'success' ? (
                        <IconCheck size={16} color="green" />
                      ) : (
                        <IconX size={16} color="red" />
                      )}
                      <Text 
                        size="xs" 
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

        <Group justify="flex-end">
          {results.length > 0 ? (
            <>
              <Button variant="light" onClick={resetMigration}>
                Migrar Más Artículos
              </Button>
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </>
          ) : (
            <>
              <Button variant="light" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                leftSection={<IconUpload size={16} />}
                onClick={migrateArticles}
                disabled={selectedArticles.length === 0 || migrating}
                loading={migrating}
              >
                Migrar {selectedArticles.length} Artículo{selectedArticles.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}