// Editor avanzado para artículos con soporte para secciones acordeón
import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  Tabs,
  Paper,
  Title,
  Text,
  ActionIcon,
  Divider,
  Alert,
  Box,
  Grid,
  ScrollArea
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconEye,
  IconCode,
  IconInfoCircle,
  IconList,
  IconSettings
} from '@tabler/icons-react';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ArticleEditor({ article, onSave, onCancel }) {
  // Estados para el artículo principal
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    meta_description: '',
    meta_keywords: '',
    content: '',
    status: 'draft'
  });

  // Estados para las secciones acordeón
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  // Función personalizada para cambiar pestañas
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Sensores para el drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Editor principal
  const mainEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
      }),
    ],
    content: '',
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        content: newContent
      }));
    },
  });

  // Cargar datos del artículo si está en modo edición
  useEffect(() => {
    if (article) {
      const articleData = article.article || article;
      const newFormData = {
        slug: articleData.slug || '',
        title: articleData.title || '',
        meta_description: articleData.meta_description || '',
        meta_keywords: articleData.meta_keywords || '',
        content: articleData.content || '',
        status: articleData.status || 'draft'
      };
      
      setFormData(newFormData);
      setSections(article.sections || []);
      
      // Actualizar el contenido del editor después de un breve delay
      if (mainEditor && newFormData.content) {
        setTimeout(() => {
          mainEditor.commands.setContent(newFormData.content);
        }, 100);
      }
    }
  }, [article, mainEditor]);

  // Función para agregar nueva sección
  const addSection = () => {
    const newSection = {
      id: Date.now(), // ID temporal
      section_key: '',
      title: '',
      description: '',
      content: '',
      order_index: sections.length
    };
    setSections(prev => [...prev, newSection]);
  };

  // Función para eliminar sección
  const removeSection = (index) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  // Función para actualizar sección
  const updateSection = (index, field, value) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    ));
  };

  // Función para reordenar secciones con drag & drop
  const handleSectionReorder = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => (item.id || items.indexOf(item)) === active.id);
        const newIndex = items.findIndex(item => (item.id || items.indexOf(item)) === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Actualizar order_index
        return newItems.map((item, index) => ({
          ...item,
          order_index: index
        }));
      });
    }
  };

  // Función para guardar
  const handleSave = () => {
    // Validaciones simplificadas - solo campos editables
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!formData.content.trim()) {
      alert('El contenido es obligatorio');
      return;
    }

    // Validar secciones
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.section_key.trim() || !section.title.trim() || !section.content.trim()) {
        alert(`La sección ${i + 1} tiene campos obligatorios vacíos`);
        return;
      }
    }

    // Preparar datos para envío (mantener slug, meta_description, meta_keywords originales)
    const articleData = {
      title: formData.title,
      content: formData.content,
      status: formData.status,
      // Mantener los campos originales
      slug: formData.slug,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords,
      sections: sections.map((section, index) => ({
        ...section,
        order_index: index
      }))
    };

    onSave(articleData);
  };

  return (
    <Stack gap="lg">
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="default"
      >
        <Tabs.List>
          <Tabs.Tab value="general">
            <Group gap="xs">
              <IconSettings size={16} />
              <span>Título y Estado</span>
            </Group>
          </Tabs.Tab>
          
          <Tabs.Tab value="content">
            <Group gap="xs">
              <IconCode size={16} />
              <span>Contenido Principal</span>
            </Group>
          </Tabs.Tab>
          
          <Tabs.Tab value="sections">
            <Group gap="xs">
              <IconList size={16} />
              <span>Secciones Acordeón ({sections.length})</span>
            </Group>
          </Tabs.Tab>
          
          <Tabs.Tab value="preview">
            <Group gap="xs">
              <IconEye size={16} />
              <span>Vista Previa</span>
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        {/* Pestaña: Información General */}
        <Tabs.Panel value="general">
          <Stack gap="md" mt="md">
           

            <Grid>
              <Grid.Col span={8}>
                <TextInput
                  label="Título del Artículo"
                  placeholder="Ej: VIH - Información Completa"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }));
                  }}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Estado"
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  data={[
                    { value: 'draft', label: 'Borrador' },
                    { value: 'published', label: 'Publicado' },
                    { value: 'archived', label: 'Archivado' }
                  ]}
                />
              </Grid.Col>
            </Grid>

          
            {/* Botón para ir a editar contenido */}
           
          </Stack>
        </Tabs.Panel>

        {/* Pestaña: Contenido Principal */}
        <Tabs.Panel value="content">
          <Stack gap="md" mt="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              Este es el contenido principal del artículo. Las secciones acordeón se agregarán automáticamente al final.
            </Alert>

            {!mainEditor ? (
              <Paper p="xl" ta="center">
                <Text c="dimmed">Cargando editor...</Text>
              </Paper>
            ) : (
              <Paper withBorder>
                <RichTextEditor editor={mainEditor}>
                  <RichTextEditor.Toolbar sticky stickyOffset={60}>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.Italic />
                      <RichTextEditor.Underline />
                      <RichTextEditor.Strikethrough />
                      <RichTextEditor.ClearFormatting />
                      <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.H1 />
                      <RichTextEditor.H2 />
                      <RichTextEditor.H3 />
                      <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Blockquote />
                      <RichTextEditor.Hr />
                      <RichTextEditor.BulletList />
                      <RichTextEditor.OrderedList />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Link />
                      <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>
                  </RichTextEditor.Toolbar>

                  <RichTextEditor.Content 
                    style={{ 
                      minHeight: '400px',
                      padding: '1rem',
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }} 
                  />
                </RichTextEditor>
              </Paper>
            )}

            {/* Información del contenido actual */}
            <Paper p="sm" bg="gray.0">
              <Text size="xs" c="dimmed">
                Contenido actual: {formData.content ? 
                  `${formData.content.length} caracteres` : 
                  'Sin contenido'
                }
              </Text>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* Pestaña: Secciones Acordeón */}
        <Tabs.Panel value="sections">
          <Stack gap="md" mt="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Secciones Acordeón</Text>
                <Text size="sm" c="dimmed">
                  Estas secciones aparecerán como un acordeón expandible al final del artículo
                </Text>
              </div>
              <Button
                leftSection={<IconPlus size={16} />}
                size="sm"
                onClick={addSection}
              >
                Agregar Sección
              </Button>
            </Group>

            {sections.length === 0 ? (
              <Paper p="xl" ta="center" bg="gray.0">
                <Text c="dimmed">No hay secciones acordeón</Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Haz clic en &quot;Agregar Sección&quot; para crear tu primera sección
                </Text>
              </Paper>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionReorder}
              >
                <SortableContext
                  items={sections.map((section, index) => section.id || index)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack gap="md">
                    {sections.map((section, index) => (
                      <SortableSection
                        key={section.id || index}
                        section={section}
                        index={index}
                        removeSection={removeSection}
                        updateSection={updateSection}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        </Tabs.Panel>

        {/* Pestaña: Vista Previa */}
        <Tabs.Panel value="preview">
          <Stack gap="md" mt="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              Vista previa de cómo se verá el artículo publicado
            </Alert>

            <Paper p="xl" shadow="sm">
              <Title order={1} size="h1" mb="md" c="#FF0048">
                {formData.title || 'Título del Artículo'}
              </Title>

              <div
                dangerouslySetInnerHTML={{ __html: formData.content }}
                style={{
                  '& h2': { color: '#FF0048', marginTop: '30px', marginBottom: '15px' },
                  '& h3': { color: '#FF0048', marginTop: '20px', marginBottom: '10px' },
                  '& p': { marginBottom: '15px', lineHeight: '1.6' },
                  '& ul': { marginBottom: '15px' },
                  '& strong': { color: '#FF0048' }
                }}
              />

              {sections.length > 0 && (
                <Box mt="xl">
                  <Title order={3} size="h3" ta="center" mb="xl" c="#FF0048">
                    Información Detallada
                  </Title>
                  {sections.map((section, index) => (
                    <Paper
                      key={index}
                      mb="xs"
                      style={{ border: '1px solid #FFB3CC', borderRadius: '8px' }}
                    >
                      <Box p="md" style={{ borderBottom: '1px solid #FFE0E8' }}>
                        <Text fw={600} c="#FF0048">
                          {section.title}
                        </Text>
                        {section.description && (
                          <Text size="sm" c="#666">
                            {section.description}
                          </Text>
                        )}
                      </Box>
                      <Box
                        p="md"
                        style={{ backgroundColor: '#FEFBFC' }}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Botones de acción */}
      <Group justify="flex-end" mt="xl">
        <Button variant="light" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} color="blue">
          {article ? 'Actualizar' : 'Crear'} Artículo
        </Button>
      </Group>
    </Stack>
  );
}

// Componente para cada sección sorteable
function SortableSection({ section, index, removeSection, updateSection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id || index });

  // Editor TipTap para cada sección
  const sectionEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
      }),
    ],
    content: section.content || '',
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      updateSection(index, 'content', newContent);
    },
  });

  // Actualizar el contenido del editor cuando cambie la sección
  useEffect(() => {
    if (sectionEditor && section.content !== sectionEditor.getHTML()) {
      sectionEditor.commands.setContent(section.content || '');
    }
  }, [section.content, sectionEditor]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      p="md"
      mb="md"
      withBorder
      shadow="sm"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <ActionIcon
              {...attributes}
              {...listeners}
              variant="light"
              color="gray"
              size="sm"
            >
              <IconGripVertical size={14} />
            </ActionIcon>
            <Text fw={500} size="sm">
              Sección {index + 1}
            </Text>
          </Group>
          <ActionIcon
            color="red"
            variant="light"
            size="sm"
            onClick={() => removeSection(index)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Clave de Sección"
              placeholder="indetectable"
              value={section.section_key}
              onChange={(e) => updateSection(index, 'section_key', e.target.value)}
              description="Identificador único (sin espacios)"
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Título"
              placeholder="Indetectable = Intransmisible"
              value={section.title}
              onChange={(e) => updateSection(index, 'title', e.target.value)}
              required
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Descripción Breve"
          placeholder="Descripción que aparece antes de expandir"
          value={section.description}
          onChange={(e) => updateSection(index, 'description', e.target.value)}
          rows={2}
        />

        <Box>
          <Text size="sm" fw={500} mb="xs">
            Contenido de la Sección <Text span c="red">*</Text>
          </Text>
          {!sectionEditor ? (
            <Paper p="md" ta="center" bg="gray.0">
              <Text c="dimmed" size="sm">Cargando editor...</Text>
            </Paper>
          ) : (
            <Paper withBorder>
              <RichTextEditor editor={sectionEditor}>
                <RichTextEditor.Toolbar>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content 
                  style={{ 
                    minHeight: '200px',
                    padding: '0.75rem',
                    fontSize: '13px',
                    lineHeight: '1.5'
                  }} 
                />
              </RichTextEditor>
            </Paper>
          )}
          <Text size="xs" c="dimmed" mt="xs">
            Usa el editor para formatear el texto. Este contenido aparecerá dentro del acordeón.
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
}