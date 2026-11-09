<<<<<<< HEAD
import React, { useState, useRef, useEffect, useCallback } from 'react';
=======
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
import { CustomServiceDefinition, BuilderElement } from '../types';
import { getAllServices, saveCustomService, deleteCustomService } from '../data/servicesStore';
import { 
  X, Plus, Trash2, Shield, Cloud, Server, Network, Check, RefreshCw, 
  Sliders, Move, Phone, Type, Minus, Maximize2, Copy, Split, Link2, Unlink,
<<<<<<< HEAD
  ZoomIn, ZoomOut, RotateCcw
=======
  ZoomIn, ZoomOut, RotateCcw, FileText, Wifi, HardDrive, Layers
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
} from 'lucide-react';
import {
  CoreRouterSvg,
  MediantRouterSvg,
  SbcClusterSvg,
  PbxSvg,
  FirewallSvg,
  PhoneSvg,
<<<<<<< HEAD
=======
  SwitchSvg,
  ServerSvg,
  WorkstationSvg,
  AccessPointSvg,
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  generateCloudPath
} from './service-builder/serviceBuilderSvgs';
import {
  getElementBoundaryPoint,
  findSnapElementAtPoint,
<<<<<<< HEAD
  getConnectorEndpoints
} from './service-builder/serviceBuilderGeometry';
import { ServiceBuilderPropertiesPanel } from './service-builder/ServiceBuilderPropertiesPanel';
import { SavedServicesTab } from './service-builder/SavedServicesTab';
=======
  getConnectorEndpoints,
  getConnectorPath,
  ConnectorShape,
  calculateOptimalBadgesPlacement
} from './service-builder/serviceBuilderGeometry';
import { ServiceBuilderPropertiesPanel } from './service-builder/ServiceBuilderPropertiesPanel';
import { SavedServicesTab } from './service-builder/SavedServicesTab';
import { generateIntakeScenario } from './service-builder/serviceBuilderScenario';
import { ServiceBuilderScenarioTab } from './service-builder/ServiceBuilderScenarioTab';
import { ServiceElementBadges } from './service-builder/ServiceElementBadges';
import { ConfirmDeleteTemplateModal } from './service-builder/ConfirmDeleteTemplateModal';
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24

interface Props {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onServicesUpdated?: () => void;
<<<<<<< HEAD
}

export function ServiceBuilderModal({ isOpen, onClose, darkMode = false, onServicesUpdated }: Props) {
  const [activeTab, setActiveTab] = useState<'studio' | 'saved'>('studio');
  const [servicesList, setServicesList] = useState<CustomServiceDefinition[]>(() => getAllServices());

  // Invoer voor nieuwe dienst opslaan
  const [serviceName, setServiceName] = useState<string>('');
  const [serviceCode, setServiceCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Dynamische elementenlijst op het canvas: begint schoon, enkel IP Voice Access Network staat standaard vast
  const [elements, setElements] = useState<BuilderElement[]>([]);

=======
  initialCategory?: 'voice' | 'data';
}

export function ServiceBuilderModal({ isOpen, onClose, darkMode = false, onServicesUpdated, initialCategory = 'voice' }: Props) {
  const [activeTab, setActiveTab] = useState<'studio' | 'scenario' | 'saved'>('studio');
  const [servicesList, setServicesList] = useState<CustomServiceDefinition[]>(() => getAllServices());

  // Invoer voor nieuwe dienst opslaan
  const [templateCategory, setTemplateCategory] = useState<'voice' | 'data' | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTemplateCategory(null);
    }
  }, [isOpen]);
  const [serviceName, setServiceName] = useState<string>('');
  const [serviceCode, setServiceCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [defaultConnectorShape, setDefaultConnectorShape] = useState<ConnectorShape>('straight');

  // Actieve template dat eventueel bewerkt wordt of geselecteerd is voor verwijdering
  const [loadedServiceId, setLoadedServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<CustomServiceDefinition | null>(null);

  // Tekstveld vraag / prompt modal state bij toevoegen van tekst in het design
  const [showTextPromptModal, setShowTextPromptModal] = useState<boolean>(false);
  const [textPromptValue, setTextPromptValue] = useState<string>('');

  const handleAddTextElement = (overrideText?: string) => {
    const rawVal = overrideText !== undefined ? overrideText : textPromptValue;
    const textLabel = rawVal.trim() || 'Tekstlabel';
    const newId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const centerX = 480;
    const centerY = 230 + (elements.length * 20) % 150;

    const newElem: BuilderElement = {
      id: newId,
      type: 'text',
      x: centerX,
      y: centerY,
      width: undefined,
      height: undefined,
      scale: 1,
      customText: textLabel,
      label: textLabel,
      fontSize: 'sm',
      textAlign: 'center',
      badgeStyle: 'badge-blue'
    };

    setElements(prev => [...prev, newElem]);
    setSelectedId(newId);
    setShowTextPromptModal(false);
    setTextPromptValue('');
    setFeedbackMsg({ text: `Tekstveld "${textLabel}" toegevoegd op het canvas.` });
  };

  // Keuze tussen Voice of Data gerelateerde templates (stil overschakelen zonder hinderlijke notificatiebalk)
  const handleSelectCategory = (cat: 'voice' | 'data') => {
    if (cat === templateCategory) return;
    setTemplateCategory(cat);
    setLoadedServiceId(null);
    setElements([]);
    setSelectedIds([]);
  };

  // Dynamische elementenlijst op het canvas: begint schoon, bij Voice staat enkel IP Voice Access Network standaard vast
  const [elements, setElements] = useState<BuilderElement[]>([]);

  // Locatie vraag in uitvraagscenario kan aan/uitgezet worden (nooit mandatory)
  const [includeLocations, setIncludeLocations] = useState<boolean>(true);

  // Automatisch opgebouwd uitvraagscenario op basis van de elementen op het canvas (klantnaam en projectnummer altijd mandatory, locatie optioneel en aan/uitzetbaar)
  const currentScenario = useMemo(() => {
    const sc = generateIntakeScenario(elements, serviceName);
    return {
      ...sc,
      includeLocations,
      locationsRequired: false,
      questions: sc.questions.filter(q => {
        if (q.id === 'general-locations') {
          return includeLocations;
        }
        return true;
      })
    };
  }, [elements, serviceName, includeLocations]);

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  // Geselecteerde elementen op het canvas (ondersteunt Shift-selectie voor meerdere elementen tegelijk)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null;
  const setSelectedId = (id: string | null) => {
    if (!id) setSelectedIds([]);
    else setSelectedIds([id]);
  };

  // Dragging & Resizing State (ondersteunt individueel en meervoudig verslepen + meebewegende connectoren)
  const [dragState, setDragState] = useState<{
    activeId: string | null;
    dragMode: 'move' | 'resize' | 'endpoint1' | 'endpoint2';
    startX: number;
    startY: number;
    hasMoved: boolean;
    idsToMove: string[];
    initialPositions: Record<string, {
      x: number;
      y: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width?: number;
      height?: number;
      scale?: number;
    }>;
    initialElemX: number;
    initialElemY: number;
    initialX1: number;
    initialY1: number;
    initialX2: number;
    initialY2: number;
    initialWidth: number;
    initialHeight: number;
    initialScale: number;
  }>({
    activeId: null,
    dragMode: 'move',
    startX: 0,
    startY: 0,
    hasMoved: false,
    idsToMove: [],
    initialPositions: {},
    initialElemX: 0,
    initialElemY: 0,
    initialX1: 0,
    initialY1: 0,
    initialX2: 0,
    initialY2: 0,
    initialWidth: 100,
    initialHeight: 40,
    initialScale: 1
  });

  // Huidig snap doelwit tijdens het slepen (visuele indicator)
  const [activeSnapTargetId, setActiveSnapTargetId] = useState<string | null>(null);

<<<<<<< HEAD
  // In- en uitzoomen van het canvas
  const [zoom, setZoom] = useState<number>(1);
  const handleZoomIn = () => setZoom(z => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, parseFloat((z - 0.1).toFixed(2))));
  const handleResetZoom = () => setZoom(1);
=======
  // In- en uitzoomen en canvas pannen (vrij bewegen bij inzoomen)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ startX: number; startY: number; initPanX: number; initPanY: number; hasPanned: boolean }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
    hasPanned: false
  });

  const handleZoomIn = () => setZoom(z => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, parseFloat((z - 0.1).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24

  const canvasRef = useRef<HTMLDivElement>(null);
  const innerCanvasRef = useRef<HTMLDivElement>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

<<<<<<< HEAD
=======
  // Globale muisluisteraars tijdens het pannen zodat snelle muisbewegingen soepel blijven doorlopen
  useEffect(() => {
    if (!isPanning) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - panStartRef.current.startX;
      const deltaY = e.clientY - panStartRef.current.startY;
      if (Math.hypot(deltaX, deltaY) > 3) {
        panStartRef.current.hasPanned = true;
      }
      setPan({
        x: panStartRef.current.initPanX + deltaX,
        y: panStartRef.current.initPanY + deltaY
      });
    };

    const handleWindowMouseUp = () => {
      if (!panStartRef.current.hasPanned) {
        setSelectedIds([]);
        setSelectedId(null);
      }
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning]);

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  // Muiswiel scroll-zoom ondersteuning op het canvas: gekoppeld via callback-ref met { passive: false } zodat muiswiel direct werkt
  const canvasCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (canvasRef.current && (canvasRef.current as any)._cleanupWheel) {
      (canvasRef.current as any)._cleanupWheel();
    }
    canvasRef.current = node;
    if (node) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        setZoom(prev => Math.min(2.5, Math.max(0.4, parseFloat((prev * factor).toFixed(2)))));
      };
      node.addEventListener('wheel', handleWheel, { passive: false });
      (node as any)._cleanupWheel = () => node.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useEffect(() => {
    if (feedbackMsg) {
      const t = setTimeout(() => setFeedbackMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [feedbackMsg]);

  // Element verwijderen
  const handleDeleteElement = (id: string) => {
    const el = elements.find(item => item.id === id);
    setElements(prev => prev.filter(item => item.id !== id).map(item => {
      if (item.type === 'connector') {
        return {
          ...item,
          sourceElementId: item.sourceElementId === id ? undefined : item.sourceElementId,
          targetElementId: item.targetElementId === id ? undefined : item.targetElementId,
        };
      }
      return item;
    }));
    setSelectedIds(prev => prev.filter(item => item !== id));
    if (el) {
      setFeedbackMsg({ text: `Element "${el.label || el.customText || el.type}" verwijderd (DEL).` });
    }
  };

  // Meerdere geselecteerde elementen tegelijk verwijderen
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setElements(prev => prev.filter(item => !selectedIds.includes(item.id)).map(item => {
      if (item.type === 'connector') {
        return {
          ...item,
          sourceElementId: selectedIds.includes(item.sourceElementId || '') ? undefined : item.sourceElementId,
          targetElementId: selectedIds.includes(item.targetElementId || '') ? undefined : item.targetElementId,
        };
      }
      return item;
    }));
    setSelectedIds([]);
    setFeedbackMsg({ text: `${count} element(en) verwijderd (DEL).` });
  };

  // DEL / Backspace toets listener om geselecteerde elementen direct weg te halen
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Niet onderscheppen wanneer de gebruiker actief in een invoerveld of tekstvak typt
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable || 
          (target as HTMLInputElement).type === 'text'
        )
      ) {
        return;
      }

      const isDeleteKey = 
        e.key === 'Delete' || 
        e.key === 'Del' || 
        e.code === 'Delete' || 
        e.key === 'Backspace' || 
        e.code === 'Backspace' || 
        e.keyCode === 46 || 
        e.keyCode === 8;

      if (isDeleteKey && selectedIds.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIds, elements]);

  const refreshList = () => {
    setServicesList(getAllServices());
    if (onServicesUpdated) onServicesUpdated();
  };

  const selectedElement = elements.find(el => el.id === selectedId);

<<<<<<< HEAD
  // Element toevoegen aan het canvas vanuit de gereedschapskist
  const handleAddElement = (type: BuilderElement['type']) => {
    const newId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const centerX = 380;
=======
  // Connector tracé kiezen (Recht, Haaks, Vloeiend) of bestaande geselecteerde connector direct aanpassen
  const handleChooseConnectorShape = (shape: ConnectorShape) => {
    setDefaultConnectorShape(shape);
    if (selectedElement && selectedElement.type === 'connector') {
      updateElement(selectedElement.id, { connectorShape: shape });
      setFeedbackMsg({ text: `Connector tracé gewijzigd naar ${shape === 'orthogonal' ? 'Haaks (90°)' : shape === 'curved' ? 'Vloeiend' : 'Recht'}.` });
    } else {
      handleAddElement('connector', shape);
    }
  };

  // Element toevoegen aan het canvas vanuit de gereedschapskist
  const handleAddElement = (type: BuilderElement['type'], shape?: ConnectorShape) => {
    const newId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const centerX = 480;
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    const centerY = 230 + (elements.length * 20) % 150;

    let newElem: BuilderElement;

    switch (type) {
      case 'router':
        newElem = {
          id: newId,
          type: 'router',
          x: centerX,
          y: centerY,
          scale: 1,
<<<<<<< HEAD
          label: ''
        };
        break;
      case 'mediant': {
        const count = elements.filter(e => e.type === 'mediant').length + 1;
=======
          label: '',
          wanIp: '',
          lanIp: '',
          showWanIp: true,
          showLanIp: templateCategory === 'data',
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      case 'mediant': {
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        newElem = {
          id: newId,
          type: 'mediant',
          x: centerX,
          y: centerY,
          scale: 1,
<<<<<<< HEAD
          label: `Mediant ${String(count).padStart(3, '0')}`
=======
          label: '',
          wanIp: '',
          lanIp: '',
          showWanIp: true,
          showLanIp: true,
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
      case 'switch': {
        newElem = {
          id: newId,
          type: 'switch',
          x: centerX,
          y: centerY,
          scale: 1,
          label: '',
          lanIp: '',
          showWanIp: false,
          showLanIp: true,
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
      case 'server': {
        newElem = {
          id: newId,
          type: 'server',
          x: centerX,
          y: centerY + 50,
          scale: 1,
          label: '',
          lanIp: '',
          showWanIp: false,
          showLanIp: true,
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
      case 'workstation': {
        newElem = {
          id: newId,
          type: 'workstation',
          x: centerX + 80,
          y: centerY + 60,
          scale: 1,
          label: '',
          lanIp: '',
          showWanIp: false,
          showLanIp: false,
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
      case 'access-point': {
        newElem = {
          id: newId,
          type: 'access-point',
          x: centerX - 80,
          y: centerY + 60,
          scale: 1,
          label: '',
          lanIp: '',
          showWanIp: false,
          showLanIp: false,
          ipPlacement: 'auto',
          namePlacement: 'auto'
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        };
        break;
      }
      case 'cloud':
        newElem = {
          id: newId,
          type: 'cloud',
          x: centerX,
<<<<<<< HEAD
          y: centerY + 40,
          width: 360,
          height: 90,
          scale: 1,
          label: 'Customer LAN'
        };
        break;
      case 'pbx': {
        const pbxCount = elements.filter(e => e.type === 'pbx').length + 1;
=======
          y: centerY + (templateCategory === 'data' ? -70 : 40),
          width: templateCategory === 'data' ? 320 : 360,
          height: 90,
          scale: 1,
          label: ''
        };
        break;
      case 'pbx': {
        const existingFw = elements.find(e => e.type === 'firewall' && e.wanIp);
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        newElem = {
          id: newId,
          type: 'pbx',
          x: centerX,
          y: centerY + 30,
          scale: 1,
<<<<<<< HEAD
          label: `SIP PBX ${pbxCount}`
        };
        break;
      }
      case 'firewall':
=======
          label: '',
          lanIp: existingFw?.wanIp || 'x.x.x.x',
          showWanIp: false,
          showLanIp: true,
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
      case 'firewall': {
        const existingPbx = elements.find(e => e.type === 'pbx' && (e.lanIp || e.wanIp));
        const terminatingPbxIp = existingPbx ? (existingPbx.lanIp || existingPbx.wanIp || 'x.x.x.x') : 'x.x.x.x';
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        newElem = {
          id: newId,
          type: 'firewall',
          x: centerX,
          y: centerY + 20,
          scale: 1,
<<<<<<< HEAD
          label: 'Firewall'
        };
        break;
=======
          label: '',
          wanIp: terminatingPbxIp,
          lanIp: '',              // Intern onbekend terrein (klantbeheer)
          showWanIp: true,        // Terminerend IP vóór FW standaard zichtbaar
          showLanIp: false,       // Intern LAN is klantbeheer (onbekend terrein)
          ipPlacement: 'auto',
          namePlacement: 'auto'
        };
        break;
      }
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
      case 'phone':
        newElem = {
          id: newId,
          type: 'phone',
          x: centerX - 60,
          y: centerY,
          scale: 1,
<<<<<<< HEAD
          label: ''
        };
        break;
      case 'connector': {
        // Connector wordt aan de zijkant klaargezet; gebruiker sleept begin- en eindpunt zelf naar de gewenste elementen
        const sideX = 70;
        const sideY1 = 200 + (elements.filter(e => e.type === 'connector').length * 24) % 140;
        const sideY2 = sideY1 + 100;
        newElem = {
          id: newId,
          type: 'connector',
          x: sideX,
          y: Math.round((sideY1 + sideY2) / 2),
          x1: sideX,
          y1: sideY1,
          x2: sideX,
          y2: sideY2,
          sourceElementId: undefined,
          targetElementId: undefined,
          lineStyle: 'solid',
          color: '#2563eb',
          strokeWidth: 2.5,
          scale: 1
        };
        break;
      }
      case 'text':
        newElem = {
          id: newId,
          type: 'text',
          x: centerX,
          y: centerY,
          width: undefined,
          height: undefined,
          scale: 1,
          customText: 'Tekst',
          fontSize: 'sm',
          textAlign: 'center',
          badgeStyle: 'badge-blue'
        };
        break;
=======
          label: '',
          namePlacement: 'auto'
        };
        break;
      case 'connector': {
        const chosenShape = shape || defaultConnectorShape || 'straight';
        if (shape) {
          setDefaultConnectorShape(shape);
        }

        // Als er 2 elementen geselecteerd zijn, verbind ze direct met de gekozen connector!
        const validSelected = selectedIds.filter(sid => {
          const item = elements.find(e => e.id === sid);
          return item && item.type !== 'connector';
        });

        if (validSelected.length >= 2) {
          const idA = validSelected[0];
          const idB = validSelected[1];
          const elA = elements.find(e => e.id === idA)!;
          const elB = elements.find(e => e.id === idB)!;
          const cWidth = innerCanvasRef.current?.clientWidth || canvasRef.current?.clientWidth || 960;
          
          const tempConn: BuilderElement = {
            id: newId,
            type: 'connector',
            sourceElementId: idA,
            targetElementId: idB,
            connectorShape: chosenShape,
            lineStyle: 'solid',
            color: '#2563eb',
            strokeWidth: 2.5,
            x: Math.round((elA.x + elB.x) / 2),
            y: Math.round((elA.y + elB.y) / 2)
          };
          const { p1, p2 } = getConnectorEndpoints(tempConn, elements, cWidth);

          newElem = {
            ...tempConn,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          };
        } else {
          // Connector klaargezet op canvas; gebruiker sleept begin- en eindpunt zelf naar de gewenste elementen
          const sideX = 70;
          const sideY1 = 200 + (elements.filter(e => e.type === 'connector').length * 24) % 140;
          const sideY2 = sideY1 + 100;
          newElem = {
            id: newId,
            type: 'connector',
            x: sideX,
            y: Math.round((sideY1 + sideY2) / 2),
            x1: sideX,
            y1: sideY1,
            x2: sideX,
            y2: sideY2,
            sourceElementId: undefined,
            targetElementId: undefined,
            connectorShape: chosenShape,
            lineStyle: 'solid',
            color: '#2563eb',
            strokeWidth: 2.5,
            scale: 1
          };
        }
        break;
      }
      case 'text':
        setTextPromptValue('');
        setShowTextPromptModal(true);
        return;
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
      default:
        return;
    }

    setElements(prev => [...prev, newElem]);
    setSelectedId(newId);
<<<<<<< HEAD
    setFeedbackMsg({ text: `Element "${newElem.label || newElem.customText || type}" toegevoegd. Druk op DEL om te wissen.` });
=======
    setFeedbackMsg({ text: `Element (${type}) toegevoegd. Druk op DEL om te wissen.` });
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  };

  // Element dupliceren
  const handleDuplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const copy: BuilderElement = {
      ...el,
      id: newId,
      x: el.x + 25,
      y: el.y + 25,
      x1: el.x1 !== undefined ? el.x1 + 25 : undefined,
      y1: el.y1 !== undefined ? el.y1 + 25 : undefined,
      x2: el.x2 !== undefined ? el.x2 + 25 : undefined,
      y2: el.y2 !== undefined ? el.y2 + 25 : undefined,
      label: el.label ? `${el.label} (Kopie)` : undefined
    };
    setElements(prev => [...prev, copy]);
    setSelectedId(newId);
  };

  // Aanpassen eigenschappen van een specifiek element
  const updateElement = (id: string, updates: Partial<BuilderElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  // Verstellen in grootte (scale)
  const adjustElementScale = (id: string, delta: number) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const current = el.scale || 1;
    const next = Math.max(0.4, Math.min(2.8, parseFloat((current + delta).toFixed(2))));
    updateElement(id, { scale: next });
  };

<<<<<<< HEAD
=======
  // Voegt direct de gewenste achterliggende topologie toe achter een firewall
  // (PBX direct achter de firewall of LAN-wolk met daarachter PBX)
  const handleAddBehindFirewall = (firewallId: string, behindType: 'direct-pbx' | 'cloud-pbx') => {
    if (templateCategory === 'data') return;
    const fw = elements.find(e => e.id === firewallId);
    if (!fw) return;

    if (behindType === 'direct-pbx') {
      const pbxId = `elem-${Date.now()}-pbx`;
      const connId = `conn-${Date.now()}-fw-pbx`;
      const targetX = fw.x + 130;
      const targetY = fw.y;

      const newPbx: BuilderElement = {
        id: pbxId,
        type: 'pbx',
        x: targetX,
        y: targetY,
        scale: 1,
        label: '',
        lanIp: fw.wanIp || 'x.x.x.x',
        showWanIp: false,
        showLanIp: true,
        ipPlacement: 'auto',
        namePlacement: 'auto'
      };

      const newConn: BuilderElement = {
        id: connId,
        type: 'connector',
        x: Math.round((fw.x + targetX) / 2),
        y: fw.y,
        x1: fw.x + 28,
        y1: fw.y,
        x2: targetX - 26,
        y2: targetY,
        sourceElementId: fw.id,
        targetElementId: pbxId,
        color: '#dc2626',
        lineStyle: 'solid',
        strokeWidth: 2,
        label: ''
      };

      setElements(prev => [...prev, newPbx, newConn]);
      setSelectedId(pbxId);
      setSelectedIds([pbxId]);
      setFeedbackMsg({ text: 'SIP PBX achter Firewall geplaatst (Klantnetwerk).' });
    } else if (behindType === 'cloud-pbx') {
      const cloudId = `elem-${Date.now()}-cloud`;
      const pbxId = `elem-${Date.now()}-pbx`;
      const conn1Id = `conn-${Date.now()}-fw-cloud`;
      const conn2Id = `conn-${Date.now()}-cloud-pbx`;
      
      const cloudX = fw.x + 110;
      const cloudY = fw.y;
      const pbxX = fw.x + 230;
      const pbxY = fw.y;

      const newCloud: BuilderElement = {
        id: cloudId,
        type: 'cloud',
        x: cloudX,
        y: cloudY,
        width: 130,
        height: 65,
        scale: 0.85,
        label: ''
      };

      const newPbx: BuilderElement = {
        id: pbxId,
        type: 'pbx',
        x: pbxX,
        y: pbxY,
        scale: 1,
        label: '',
        lanIp: fw.wanIp || 'x.x.x.x',
        showWanIp: false,
        showLanIp: true,
        ipPlacement: 'auto',
        namePlacement: 'auto'
      };

      const newConn1: BuilderElement = {
        id: conn1Id,
        type: 'connector',
        x: Math.round((fw.x + cloudX) / 2),
        y: fw.y,
        x1: fw.x + 28,
        y1: fw.y,
        x2: cloudX - 45,
        y2: cloudY,
        sourceElementId: fw.id,
        targetElementId: cloudId,
        color: '#dc2626',
        lineStyle: 'solid',
        strokeWidth: 2,
        label: ''
      };

      const newConn2: BuilderElement = {
        id: conn2Id,
        type: 'connector',
        x: Math.round((cloudX + pbxX) / 2),
        y: fw.y,
        x1: cloudX + 45,
        y1: cloudY,
        x2: pbxX - 26,
        y2: pbxY,
        sourceElementId: cloudId,
        targetElementId: pbxId,
        color: '#475569',
        lineStyle: 'dashed',
        strokeWidth: 2,
        label: ''
      };

      setElements(prev => [...prev, newCloud, newPbx, newConn1, newConn2]);
      setSelectedId(pbxId);
      setSelectedIds([pbxId]);
      setFeedbackMsg({ text: 'Customer LAN-wolk en PBX achter Firewall geplaatst.' });
    }
  };

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  // Start met slepen van een element (met Shift-selectie ondersteuning & meebewegende connectoren)
  const handleMouseDownElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      active.blur();
    }

    let activeSelected = selectedIds;
    if (e.shiftKey) {
      if (selectedIds.includes(id)) {
        activeSelected = selectedIds.filter(x => x !== id);
      } else {
        activeSelected = [...selectedIds, id];
      }
      setSelectedIds(activeSelected);
    } else {
      if (!selectedIds.includes(id)) {
        activeSelected = [id];
        setSelectedIds([id]);
      }
    }

    const el = elements.find(item => item.id === id);
    if (!el) return;

    // Bepaal welke elementen tegelijk versleept worden
    const idsToMove = activeSelected.includes(id) ? activeSelected : [id];
    const cWidth = innerCanvasRef.current?.clientWidth || canvasRef.current?.clientWidth || 960;

<<<<<<< HEAD
=======
    const isDataMode = templateCategory === 'data';
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    // Auto-detecteer en koppel connectoren waarvan het begin- of eindpunt contact maakt met dit element
    const updatedElements = elements.map(item => {
      if (item.type !== 'connector') return item;
      const { p1, p2 } = getConnectorEndpoints(item, elements, cWidth);
      let newSrc = item.sourceElementId;
      let newTgt = item.targetElementId;
      if (!newSrc) {
<<<<<<< HEAD
        const snap = findSnapElementAtPoint(p1.x, p1.y, elements, cWidth);
        if (snap) newSrc = snap;
      }
      if (!newTgt) {
        const snap = findSnapElementAtPoint(p2.x, p2.y, elements, cWidth);
=======
        const snap = findSnapElementAtPoint(p1.x, p1.y, elements, cWidth, 45, isDataMode);
        if (snap) newSrc = snap;
      }
      if (!newTgt) {
        const snap = findSnapElementAtPoint(p2.x, p2.y, elements, cWidth, 45, isDataMode);
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        if (snap) newTgt = snap;
      }
      if (newSrc !== item.sourceElementId || newTgt !== item.targetElementId) {
        return { ...item, sourceElementId: newSrc, targetElementId: newTgt };
      }
      return item;
    });

    if (JSON.stringify(updatedElements) !== JSON.stringify(elements)) {
      setElements(updatedElements);
    }

    // Verzamel uiterst nauwkeurige startposities voor alle elementen en connectoren
    const initialPositions: Record<string, {
      x: number;
      y: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width?: number;
      height?: number;
      scale?: number;
    }> = {};

    updatedElements.forEach(item => {
      if (item.type === 'connector') {
        const { p1, p2 } = getConnectorEndpoints(item, updatedElements, cWidth);
        initialPositions[item.id] = {
          x: item.x,
          y: item.y,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          width: item.width,
          height: item.height,
          scale: item.scale
        };
      } else {
        initialPositions[item.id] = {
          x: item.x,
          y: item.y,
          x1: item.x - 60,
          y1: item.y,
          x2: item.x + 60,
          y2: item.y,
          width: item.width,
          height: item.height,
          scale: item.scale
        };
      }
    });

    const targetInit = initialPositions[el.id];

    setDragState({
      activeId: id,
      dragMode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      idsToMove,
      initialPositions,
      initialElemX: el.x,
      initialElemY: el.y,
      initialX1: targetInit ? targetInit.x1 : (el.x - 60),
      initialY1: targetInit ? targetInit.y1 : el.y,
      initialX2: targetInit ? targetInit.x2 : (el.x + 60),
      initialY2: targetInit ? targetInit.y2 : el.y,
      initialWidth: el.width || 100,
      initialHeight: el.height || 40,
      initialScale: el.scale || 1
    });
  };

  // Start met slepen van een specifiek connector-eindpunt (eindpunt 1 of 2)
  const handleMouseDownConnectorEnd = (id: string, endpoint: 1 | 2, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
<<<<<<< HEAD
=======
    setSelectedIds([id]);
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    if (!el) return;

    const cWidth = innerCanvasRef.current?.clientWidth || canvasRef.current?.clientWidth || 960;
    const { p1, p2 } = getConnectorEndpoints(el, elements, cWidth);

    setDragState({
      activeId: id,
      dragMode: endpoint === 1 ? 'endpoint1' : 'endpoint2',
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      idsToMove: [id],
      initialPositions: {
        [id]: {
          x: el.x,
          y: el.y,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y
        }
      },
      initialElemX: el.x,
      initialElemY: el.y,
      initialX1: p1.x,
      initialY1: p1.y,
      initialX2: p2.x,
      initialY2: p2.y,
      initialWidth: el.width || 100,
      initialHeight: el.height || 40,
      initialScale: el.scale || 1
    });
  };

  // Start met formaataanpassing via de hoekgreep
  const handleMouseDownResize = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    if (!el) return;

    setDragState({
      activeId: id,
      dragMode: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      idsToMove: [id],
      initialPositions: {
        [id]: {
          x: el.x,
          y: el.y,
          x1: el.x - 60,
          y1: el.y,
          x2: el.x + 60,
          y2: el.y,
          width: el.width,
          height: el.height,
          scale: el.scale
        }
      },
      initialElemX: el.x,
      initialElemY: el.y,
      initialX1: el.x1 ?? (el.x - 60),
      initialY1: el.y1 ?? el.y,
      initialX2: el.x2 ?? (el.x + 60),
      initialY2: el.y2 ?? el.y,
      initialWidth: el.width || 100,
      initialHeight: el.height || 40,
      initialScale: el.scale || 1
    });
  };

<<<<<<< HEAD
  // Muisbeweging over het canvas: ondersteunt slepen en ALTIJD magnetisch aansluiten aan het doelelement
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
=======
  // Start met pannen van het canvas bij klikken op een vrij stuk
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Alleen bij linker (0) of middelste muisknop (1)
    if (e.button !== 0 && e.button !== 1) return;

    // Als er op een interactief element geklikt is (input, button, textarea), geen pan starten
    const target = e.target as HTMLElement;
    if (target.closest('input, button, select, textarea')) return;

    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: pan.x,
      initPanY: pan.y,
      hasPanned: false
    };
    setIsPanning(true);
  };

  // Muisbeweging over het canvas: ondersteunt vrij pannen van het hele canvas én slepen van elementen
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // 1. Canvas pannen wanneer de gebruiker over het vrije canvas sleept
    if (isPanning) {
      const deltaX = e.clientX - panStartRef.current.startX;
      const deltaY = e.clientY - panStartRef.current.startY;
      if (Math.hypot(deltaX, deltaY) > 3) {
        panStartRef.current.hasPanned = true;
      }
      setPan({
        x: panStartRef.current.initPanX + deltaX,
        y: panStartRef.current.initPanY + deltaY
      });
      return;
    }

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    if (!dragState.activeId) return;
    const innerEl = innerCanvasRef.current || canvasRef.current;
    if (!innerEl) return;
    const innerRect = innerEl.getBoundingClientRect();

    const canvasWidth = innerEl.clientWidth || 960;
    const currentCanvasX = Math.round((e.clientX - innerRect.left) / zoom);
    const currentCanvasY = Math.round((e.clientY - innerRect.top) / zoom);

    const dx = Math.round((e.clientX - dragState.startX) / zoom);
    const dy = Math.round((e.clientY - dragState.startY) / zoom);

    const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
    if (!dragState.hasMoved && dist > 3) {
      setDragState(prev => ({ ...prev, hasMoved: true }));
    }

    const el = elements.find(item => item.id === dragState.activeId);
    if (!el) return;

    if (dragState.dragMode === 'endpoint1') {
      // Eindpunt 1 individueel slepen met magnetische aansluiting op de buitenrand
<<<<<<< HEAD
      const snapTarget = findSnapElementAtPoint(currentCanvasX, currentCanvasY, elements, canvasWidth);
=======
      const snapTarget = findSnapElementAtPoint(currentCanvasX, currentCanvasY, elements, canvasWidth, 45, templateCategory === 'data');
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
      setActiveSnapTargetId(snapTarget);

      const x2 = el.x2 ?? dragState.initialX2;
      const y2 = el.y2 ?? dragState.initialY2;

      let nextX1 = currentCanvasX;
      let nextY1 = currentCanvasY;

      if (snapTarget) {
        const bp = getElementBoundaryPoint(snapTarget, elements, { x: x2, y: y2 }, canvasWidth);
        nextX1 = bp.x;
        nextY1 = bp.y;
      }

      updateElement(dragState.activeId, {
        x1: nextX1,
        y1: nextY1,
        sourceElementId: snapTarget || undefined,
        x: Math.round((nextX1 + x2) / 2),
        y: Math.round((nextY1 + y2) / 2)
      });
    } else if (dragState.dragMode === 'endpoint2') {
      // Eindpunt 2 individueel slepen met magnetische aansluiting op de buitenrand
<<<<<<< HEAD
      const snapTarget = findSnapElementAtPoint(currentCanvasX, currentCanvasY, elements, canvasWidth);
=======
      const snapTarget = findSnapElementAtPoint(currentCanvasX, currentCanvasY, elements, canvasWidth, 45, templateCategory === 'data');
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
      setActiveSnapTargetId(snapTarget);

      const x1 = el.x1 ?? dragState.initialX1;
      const y1 = el.y1 ?? dragState.initialY1;

      let nextX2 = currentCanvasX;
      let nextY2 = currentCanvasY;

      if (snapTarget) {
        const bp = getElementBoundaryPoint(snapTarget, elements, { x: x1, y: y1 }, canvasWidth);
        nextX2 = bp.x;
        nextY2 = bp.y;
      }

      updateElement(dragState.activeId, {
        x2: nextX2,
        y2: nextY2,
        targetElementId: snapTarget || undefined,
        x: Math.round((x1 + nextX2) / 2),
        y: Math.round((y1 + nextY2) / 2)
      });
    } else if (dragState.dragMode === 'resize') {
      if (el.type === 'cloud' || el.type === 'text') {
        const nextW = Math.max(50, Math.min(800, dragState.initialWidth + dx));
        const nextH = Math.max(20, Math.min(400, dragState.initialHeight + dy));
        updateElement(dragState.activeId, { width: nextW, height: nextH });
      } else {
        const scaleDelta = (dx + dy) / 160;
        const nextScale = Math.max(0.4, Math.min(2.8, parseFloat((dragState.initialScale + scaleDelta).toFixed(2))));
        updateElement(dragState.activeId, { scale: nextScale });
      }
    } else {
      // Element(en) verplaatsen - inclusief aangesloten connectoren die meebewegen!
      const idsToMove = dragState.idsToMove && dragState.idsToMove.length > 0 
        ? dragState.idsToMove 
        : (dragState.activeId ? [dragState.activeId] : []);

      setElements(prev => prev.map(item => {
        const init = dragState.initialPositions[item.id];
        if (!init) return item;

        // 1. Is dit element direct geselecteerd om verplaatst te worden?
        if (idsToMove.includes(item.id)) {
          if (item.type === 'connector') {
            const curX1 = init.x1 + dx;
            const curY1 = init.y1 + dy;
            const curX2 = init.x2 + dx;
            const curY2 = init.y2 + dy;
<<<<<<< HEAD
=======
            const sourceMoves = Boolean(item.sourceElementId && idsToMove.includes(item.sourceElementId));
            const targetMoves = Boolean(item.targetElementId && idsToMove.includes(item.targetElementId));
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
            return {
              ...item,
              x: init.x + dx,
              y: init.y + dy,
              x1: curX1,
              y1: curY1,
              x2: curX2,
<<<<<<< HEAD
              y2: curY2
=======
              y2: curY2,
              sourceElementId: sourceMoves ? item.sourceElementId : undefined,
              targetElementId: targetMoves ? item.targetElementId : undefined
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
            };
          }
          return {
            ...item,
            x: init.x + dx,
            y: init.y + dy
          };
        }

        // 2. Is dit een connector die aangesloten is op één of meer van de verplaatste elementen?
        if (item.type === 'connector') {
          const sourceMoves = Boolean(item.sourceElementId && idsToMove.includes(item.sourceElementId));
          const targetMoves = Boolean(item.targetElementId && idsToMove.includes(item.targetElementId));

          if (sourceMoves || targetMoves) {
            const curX1 = init.x1 + (sourceMoves ? dx : 0);
            const curY1 = init.y1 + (sourceMoves ? dy : 0);
            const curX2 = init.x2 + (targetMoves ? dx : 0);
            const curY2 = init.y2 + (targetMoves ? dy : 0);

            return {
              ...item,
              x1: curX1,
              y1: curY1,
              x2: curX2,
              y2: curY2,
              x: Math.round((curX1 + curX2) / 2),
              y: Math.round((curY1 + curY2) / 2)
            };
          }
        }

        return item;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
<<<<<<< HEAD
=======
    // Afronden van canvas panning
    if (isPanning) {
      if (!panStartRef.current.hasPanned) {
        // Enkele klik op een vrij stuk: selectie wissen
        setSelectedIds([]);
        setSelectedId(null);
      }
      setIsPanning(false);
      return;
    }

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    if (dragState.activeId) {
      if (activeSnapTargetId) {
        setFeedbackMsg({ text: 'Connector succesvol aangesloten aan gekozen element.' });
      }

      // Bij afronden van slepen: controleer of connectoren die verplaatst zijn op een element aansluiten
      const cWidth = innerCanvasRef.current?.clientWidth || canvasRef.current?.clientWidth || 960;
      setElements(prev => prev.map(item => {
        if (item.type !== 'connector') return item;
        const { p1, p2 } = getConnectorEndpoints(item, prev, cWidth);
<<<<<<< HEAD
        let newSrc = item.sourceElementId;
        let newTgt = item.targetElementId;
        if (!newSrc) {
          const snap = findSnapElementAtPoint(p1.x, p1.y, prev, cWidth);
          if (snap) newSrc = snap;
        }
        if (!newTgt) {
          const snap = findSnapElementAtPoint(p2.x, p2.y, prev, cWidth);
=======
        const isDataMode = templateCategory === 'data';
        let newSrc = item.sourceElementId;
        let newTgt = item.targetElementId;
        if (!newSrc) {
          const snap = findSnapElementAtPoint(p1.x, p1.y, prev, cWidth, 45, isDataMode);
          if (snap) newSrc = snap;
        }
        if (!newTgt) {
          const snap = findSnapElementAtPoint(p2.x, p2.y, prev, cWidth, 45, isDataMode);
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
          if (snap) newTgt = snap;
        }
        if (newSrc !== item.sourceElementId || newTgt !== item.targetElementId) {
          return { ...item, sourceElementId: newSrc, targetElementId: newTgt };
        }
        return item;
      }));

      setDragState(prev => ({ ...prev, activeId: null, dragMode: 'move', hasMoved: false }));
      setActiveSnapTargetId(null);
    }
  };

<<<<<<< HEAD
  // Canvas herstellen naar basisopzet: enkel het IP Voice Access Network
  const handleResetCanvas = () => {
    setElements([]);
    setSelectedId(null);
    setFeedbackMsg({ text: 'Canvas leeggemaakt. Alleen het standaard IP Voice Access Network staat klaar.' });
=======
  // Canvas herstellen naar basisopzet
  const handleResetCanvas = () => {
    setElements([]);
    setSelectedId(null);
    if (templateCategory === 'data') {
      setFeedbackMsg({ text: 'Canvas leeggemaakt. U begint met een leeg canvas.' });
    } else {
      setFeedbackMsg({ text: 'Canvas leeggemaakt. Alleen het standaard IP Voice Access Network staat klaar.' });
    }
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  };

  // Opslaan onder gekozen naam
  const handleSaveNewService = () => {
    if (!serviceName.trim()) {
      setFeedbackMsg({ text: 'Vul a.u.b. een naam in voor de nieuwe dienst.', isError: true });
      return;
    }
    const finalCode = (serviceCode.trim() || serviceName.trim().slice(0, 6)).toUpperCase().replace(/[^A-Z0-9-]/g, '');

    const mediantCount = elements.filter(e => e.type === 'mediant').length;
    const routerCount = elements.filter(e => e.type === 'router').length;
    const totalCpe = Math.max(1, mediantCount + routerCount);

    const hasFirewallElem = elements.some(e => e.type === 'firewall');
    const hasCloudElem = elements.some(e => e.type === 'cloud');
    const hasPbxElem = elements.some(e => e.type === 'pbx');
    const hasPhoneElem = elements.some(e => e.type === 'phone');

<<<<<<< HEAD
    const newDef: CustomServiceDefinition = {
      id: `custom-${Date.now()}`,
      name: serviceName.trim(),
      code: finalCode,
      description: description.trim() || `Dienst met ${totalCpe}x CPE/Mediant(en).`,
      cpeCount: totalCpe,
      hostnamePrefix: 'Mediant',
      hasWan: true,
      hasVoiceLan: true,
      hasCn: elements.some(e => (e.label || '').toUpperCase().includes('CN')),
      hasCustomerLanCloud: hasCloudElem,
      hasSecondLanCloud: elements.filter(e => e.type === 'cloud').length > 1,
      hasPhoneIcon: hasPhoneElem,
      hasFirewall: hasFirewallElem,
      firewallHasConnectors: false,
      firewallIpRole: hasFirewallElem ? 'pbx' : 'none',
      allowDemarcationLine: false,
      hasLocalPbx: hasPbxElem,
      hasRoutedPbx: false,
      hasDefaultGateway: true,
      isBuiltIn: false,
      builderElements: elements
=======
    const isDataTemplate = templateCategory === 'data';
    const existingId = loadedServiceId || `custom-${Date.now()}`;
    const newDef: CustomServiceDefinition = {
      id: existingId,
      name: serviceName.trim(),
      code: finalCode,
      category: templateCategory,
      description: description.trim() || `${isDataTemplate ? 'Data' : 'Voice'} template met ${totalCpe}x CPE/element(en).`,
      cpeCount: totalCpe,
      hostnamePrefix: isDataTemplate ? (elements.some(e => e.type === 'switch') ? 'Switch' : 'Router') : 'Mediant',
      hasWan: isDataTemplate ? (elements.some(e => e.type === 'router' || e.showWanIp) || true) : true,
      hasVoiceLan: !isDataTemplate,
      hasCn: elements.some(e => (e.label || '').toUpperCase().includes('CN')),
      hasCustomerLanCloud: hasCloudElem,
      hasSecondLanCloud: elements.filter(e => e.type === 'cloud').length > 1,
      hasPhoneIcon: isDataTemplate ? false : hasPhoneElem,
      hasFirewall: hasFirewallElem,
      firewallHasConnectors: isDataTemplate,
      firewallIpRole: hasFirewallElem ? (isDataTemplate ? 'none' : 'pbx') : 'none',
      allowDemarcationLine: false,
      hasLocalPbx: isDataTemplate ? false : hasPbxElem,
      hasRoutedPbx: false,
      hasDefaultGateway: true,
      isBuiltIn: false,
      builderElements: elements,
      intakeScenario: currentScenario
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
    };

    saveCustomService(newDef);
    refreshList();
<<<<<<< HEAD
    setFeedbackMsg({ text: `Dienst "${newDef.name}" (${newDef.code}) succesvol opgeslagen! Direct beschikbaar.` });

    setServiceName('');
    setServiceCode('');
    setDescription('');
  };

  const handleDeleteSaved = (id: string) => {
    deleteCustomService(id);
    refreshList();
    setFeedbackMsg({ text: 'Dienst verwijderd.' });
=======
    setLoadedServiceId(existingId);
    setFeedbackMsg({ text: `Template "${newDef.name}" (${newDef.code}) succesvol opgeslagen! Direct beschikbaar.` });
  };

  // Aanvraag voor verwijderen: toont eerst het dialoogvenster met waarschuwing
  const handleRequestDelete = (svc: CustomServiceDefinition) => {
    setServiceToDelete(svc);
  };

  // Definitief verwijderen bevestigd door gebruiker
  const handleConfirmDelete = () => {
    if (!serviceToDelete) return;
    if (serviceToDelete.isBuiltIn) {
      setFeedbackMsg({ text: 'Ingebouwde standaardsystemen kunnen niet worden verwijderd.', isError: true });
      setServiceToDelete(null);
      return;
    }

    const deletedName = serviceToDelete.name;
    const deletedCode = serviceToDelete.code;
    deleteCustomService(serviceToDelete.id);
    refreshList();

    if (loadedServiceId === serviceToDelete.id) {
      setLoadedServiceId(null);
      setServiceName('');
      setServiceCode('');
      setDescription('');
      setElements([]);
      setSelectedIds([]);
    }

    setFeedbackMsg({ text: `Template "${deletedName}" (${deletedCode}) is definitief verwijderd.` });
    setServiceToDelete(null);
  };

  const handleCancelDelete = () => {
    setServiceToDelete(null);
  };

function generateDefaultElementsForService(svc: CustomServiceDefinition): BuilderElement[] {
  if (svc.builderElements && svc.builderElements.length > 0) {
    return svc.builderElements;
  }

  const elems: BuilderElement[] = [];
  const code = svc.code;

  if (code === 'VOV') {
    elems.push({
      id: 'elem-vov-mediant',
      type: 'mediant',
      x: 480,
      y: 128,
      scale: 1,
      label: 'Mediant CPE',
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-vov-cloud',
      type: 'cloud',
      x: 480,
      y: 265,
      width: 340,
      height: 85,
      scale: 1,
      label: 'Customer LAN'
    });
    elems.push({
      id: 'elem-vov-pbx',
      type: 'pbx',
      x: 480,
      y: 385,
      scale: 1,
      label: 'SIP PBX',
      lanIp: '',
      showWanIp: false,
      showLanIp: true,
      ipPlacement: 'right',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'conn-vov-1',
      type: 'connector',
      x: 480, y: 195, x1: 480, y1: 147, x2: 480, y2: 230,
      sourceElementId: 'elem-vov-mediant', targetElementId: 'elem-vov-cloud',
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
    elems.push({
      id: 'conn-vov-2',
      type: 'connector',
      x: 480, y: 330, x1: 480, y1: 290, x2: 480, y2: 365,
      sourceElementId: 'elem-vov-cloud', targetElementId: 'elem-vov-pbx',
      color: '#2563eb', strokeWidth: 2, lineStyle: 'dashed', connectorShape: 'straight'
    });
  } else if (code === 'CN') {
    elems.push({
      id: 'elem-cn-router',
      type: 'router',
      x: 480,
      y: 128,
      scale: 1,
      label: 'CN Router',
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-cn-cloud',
      type: 'cloud',
      x: 480,
      y: 265,
      width: 340,
      height: 85,
      scale: 1,
      label: 'Corporate Net'
    });
    elems.push({
      id: 'conn-cn-1',
      type: 'connector',
      x: 480, y: 195, x1: 480, y1: 147, x2: 480, y2: 230,
      sourceElementId: 'elem-cn-router', targetElementId: 'elem-cn-cloud',
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
  } else if (code === 'VOV+CN' || code === 'VOV & CN') {
    elems.push({
      id: 'elem-vovcn-mediant',
      type: 'mediant',
      x: 480,
      y: 128,
      scale: 1,
      label: 'Mediant VOV+CN',
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-vovcn-cloud',
      type: 'cloud',
      x: 480,
      y: 265,
      width: 360,
      height: 85,
      scale: 1,
      label: 'Customer Voice & CN LAN'
    });
    elems.push({
      id: 'elem-vovcn-pbx',
      type: 'pbx',
      x: 480,
      y: 385,
      scale: 1,
      label: 'SIP PBX',
      lanIp: '',
      showWanIp: false,
      showLanIp: true,
      ipPlacement: 'right',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'conn-vovcn-1',
      type: 'connector',
      x: 480, y: 195, x1: 480, y1: 147, x2: 480, y2: 230,
      sourceElementId: 'elem-vovcn-mediant', targetElementId: 'elem-vovcn-cloud',
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
    elems.push({
      id: 'conn-vovcn-2',
      type: 'connector',
      x: 480, y: 330, x1: 480, y1: 290, x2: 480, y2: 365,
      sourceElementId: 'elem-vovcn-cloud', targetElementId: 'elem-vovcn-pbx',
      color: '#2563eb', strokeWidth: 2, lineStyle: 'dashed', connectorShape: 'straight'
    });
  } else if (code.includes('Multicustomer') || code.includes('Esprit') || code.includes('IP Voice') || code.includes('Kinwel')) {
    const isKinwel = code.includes('Kinwel');
    const isIpVoice = code.includes('IP Voice') || code.includes('IP Services');
    const host006 = isKinwel ? 'DS4-M2600-ASD-002' : (isIpVoice ? 'UFC-M2600-ASD-006' : 'N2G-M4000-ASD-006');
    const host007 = isKinwel ? 'DS4-M2600-ASD-005' : (isIpVoice ? 'UFC-M2600-ASD-002' : 'N2G-M4000-ASD-007');

    elems.push({
      id: 'elem-multi-m1',
      type: 'mediant',
      x: 340,
      y: 125,
      scale: 1,
      label: host006,
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-multi-m2',
      type: 'mediant',
      x: 620,
      y: 125,
      scale: 1,
      label: host007,
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'right',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-multi-cloud',
      type: 'cloud',
      x: 480,
      y: 245,
      width: 440,
      height: 90,
      scale: 1,
      label: isKinwel ? 'Kinwel LAN' : (isIpVoice ? 'IP Voice LAN' : 'Esprit LAN')
    });
    elems.push({
      id: 'elem-multi-fw',
      type: 'firewall',
      x: 480,
      y: 345,
      scale: 1,
      label: 'Firewall',
      wanIp: '',
      showWanIp: true,
      showLanIp: false,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: 'elem-multi-pbx',
      type: 'pbx',
      x: 620,
      y: 345,
      scale: 1,
      label: 'SIP PBX',
      lanIp: '',
      showWanIp: false,
      showLanIp: true,
      ipPlacement: 'right',
      namePlacement: 'bottom'
    });

    elems.push({
      id: 'conn-m1-cloud',
      type: 'connector',
      x: 390, y: 180, x1: 340, y1: 144, x2: 410, y2: 220,
      sourceElementId: 'elem-multi-m1', targetElementId: 'elem-multi-cloud',
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
    elems.push({
      id: 'conn-m2-cloud',
      type: 'connector',
      x: 570, y: 180, x1: 620, y1: 144, x2: 550, y2: 220,
      sourceElementId: 'elem-multi-m2', targetElementId: 'elem-multi-cloud',
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
    elems.push({
      id: 'conn-cloud-fw',
      type: 'connector',
      x: 480, y: 300, x1: 480, y1: 270, x2: 480, y2: 330,
      sourceElementId: 'elem-multi-cloud', targetElementId: 'elem-multi-fw',
      color: '#dc2626', strokeWidth: 2, connectorShape: 'straight'
    });
    elems.push({
      id: 'conn-fw-pbx',
      type: 'connector',
      x: 550, y: 345, x1: 505, y1: 345, x2: 595, y2: 345,
      sourceElementId: 'elem-multi-fw', targetElementId: 'elem-multi-pbx',
      color: '#dc2626', strokeWidth: 2, lineStyle: 'dashed', connectorShape: 'straight'
    });
  } else {
    elems.push({
      id: `elem-${Date.now()}-router`,
      type: svc.category === 'data' ? 'router' : 'mediant',
      x: 480,
      y: 128,
      scale: 1,
      label: svc.hostnamePrefix || svc.name,
      wanIp: '',
      lanIp: '',
      showWanIp: true,
      showLanIp: true,
      ipPlacement: 'left',
      namePlacement: 'bottom'
    });
    elems.push({
      id: `elem-${Date.now()}-cloud`,
      type: 'cloud',
      x: 480,
      y: 265,
      width: 340,
      height: 85,
      scale: 1,
      label: `${svc.name} LAN`
    });
    elems.push({
      id: `conn-${Date.now()}-1`,
      type: 'connector',
      x: 480, y: 195, x1: 480, y1: 147, x2: 480, y2: 230,
      sourceElementId: `elem-${Date.now()}-router`, targetElementId: `elem-${Date.now()}-cloud`,
      color: '#2563eb', strokeWidth: 2.5, connectorShape: 'straight'
    });
  }

  return elems;
}

  // Template openen in studio
  const handleLoadService = (svc: CustomServiceDefinition) => {
    setLoadedServiceId(svc.isBuiltIn ? null : svc.id);
    setServiceName(svc.name ? (svc.isBuiltIn ? `${svc.name} (Kopie)` : svc.name) : '');
    setServiceCode(svc.code ? (svc.isBuiltIn ? `${svc.code}-CUSTOM` : svc.code) : '');
    setDescription(svc.description || '');
    setTemplateCategory(svc.category === 'data' ? 'data' : 'voice');
    
    if (svc.builderElements && svc.builderElements.length > 0) {
      setElements(svc.builderElements);
    } else {
      setElements(generateDefaultElementsForService(svc));
    }
    setSelectedIds([]);
    setActiveTab('studio');
    setFeedbackMsg({ 
      text: svc.isBuiltIn 
        ? `Bestaande dienst "${svc.name}" geladen in Studio als basis voor een nieuw template.` 
        : `Bestaande dienst "${svc.name}" geladen in Studio.` 
    });
  };

  const handleDeleteSaved = (id: string) => {
    const svc = servicesList.find(s => s.id === id);
    if (svc) {
      handleRequestDelete(svc);
    } else {
      deleteCustomService(id);
      refreshList();
      setFeedbackMsg({ text: 'Dienst verwijderd.' });
    }
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  };

  const getTargetName = (targetId?: string) => {
    if (!targetId) return 'Vrij op canvas';
    if (targetId === 'ip-voice-cloud') return 'IP Voice Access Network (Wolk)';
    if (targetId === 'core-router-fixed') return 'Core Router (Bovenaan)';
    if (targetId === 'sbc-cluster-fixed') return 'SBC Cluster (Bovenaan)';
    const el = elements.find(e => e.id === targetId);
    if (!el) return targetId;
<<<<<<< HEAD
    return el.label || el.customText || el.type.toUpperCase();
=======
    if (el.label) return el.label;
    if (el.customText) return el.customText;
    if (el.type === 'phone') return 'Telefoontoestel';
    if (el.type === 'switch') return 'Switch';
    if (el.type === 'server') return 'Server';
    if (el.type === 'access-point') return 'Access Point';
    return el.type.toUpperCase();
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
  };

  if (!isOpen) return null;

  const canvasWidth = innerCanvasRef.current?.clientWidth || canvasRef.current?.clientWidth || 960;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`relative w-full max-w-7xl max-h-[96vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Top Header */}
        <div className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'border-slate-800 bg-slate-850' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
<<<<<<< HEAD
                  Diensten Bouwer &amp; Architectuur Studio
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Volledig Verstelbaar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                IP Voice Access Network met SBC Cluster &amp; router staat vast zoals in elk design. Sleep connectoren direct naar elementen om aan te sluiten.
              </p>
=======
                  Templates
                </h2>
              </div>
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex p-1 rounded-xl border text-xs font-semibold ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'studio' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
<<<<<<< HEAD
                🛠️ Bouwstudio
=======
                📋 Templates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scenario')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'scenario' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bekijk hoe het uitvraagscenario met IP-adressen, klantnaam, projectnummer en locaties automatisch wordt opgebouwd"
              >
                <span>📋 Uitvraagscenario</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'scenario'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                }`}>
                  {currentScenario.questions.filter(q => q.category !== 'general').length} IP
                </span>
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'saved' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
<<<<<<< HEAD
                📋 Opgeslagen Diensten ({servicesList.filter(s => !s.isBuiltIn).length})
=======
                📋 Bestaande diensten ({servicesList.length})
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
              }`}
              title="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificatiebalk */}
        {feedbackMsg && (
          <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
            feedbackMsg.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
          }`}>
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-[10px] underline ml-2 cursor-pointer">Sluiten</button>
          </div>
        )}

        {/* Hoofdinhoud */}
        {activeTab === 'studio' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* LINKER ZIJBALK: Gereedschapskist met alle gewenste elementen */}
            <div className={`w-full md:w-[290px] shrink-0 border-r flex flex-col overflow-y-auto p-3.5 space-y-4 ${
              darkMode ? 'bg-slate-850/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              
<<<<<<< HEAD
              {/* Elementen Palet */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  1. Elementen Toevoegen
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* 1. Router */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('router')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Network className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Router</span>
                    <span className="text-[9px] text-slate-400 leading-none">Core / IP</span>
                  </button>

                  {/* 2. Mediant */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('mediant')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Mediant</span>
                    <span className="text-[9px] text-slate-400 leading-none">AudioCodes CPE</span>
                  </button>

                  {/* 3. Customer LAN Wolk */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('cloud')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">LAN Wolk</span>
                    <span className="text-[9px] text-slate-400 leading-none">Customer LAN</span>
                  </button>

                  {/* 4. SIP PBX */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('pbx')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">SIP PBX</span>
                    <span className="text-[9px] text-slate-400 leading-none">Telefooncentrale</span>
                  </button>

                  {/* 5. Firewall */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('firewall')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Firewall</span>
                    <span className="text-[9px] text-slate-400 leading-none">Beveiliging</span>
                  </button>

                  {/* 6. Telefoonhoorn */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('phone')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Telefoonhoorn</span>
                    <span className="text-[9px] text-slate-400 leading-none">IP Endpoint</span>
                  </button>

                  {/* 7. Connectoren */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('connector')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                      <Split className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Connector</span>
                    <span className="text-[9px] text-slate-400 leading-none">Aan zijkant</span>
                  </button>

                  {/* 8. Tekstveldjes */}
                  <button
                    type="button"
                    onClick={() => handleAddElement('text')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
                      <Type className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight">Tekstveld</span>
                    <span className="text-[9px] text-slate-400 leading-none">Direct typen</span>
=======
              {/* BESTAANDE DIENSTEN SELECTOR */}
              <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Bestaande diensten
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                    {servicesList.length} beschikbaar
                  </span>
                </div>
                <select
                  className={`w-full text-xs font-semibold p-2 rounded-xl border transition-all cursor-pointer ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                  value={loadedServiceId || ''}
                  onChange={(e) => {
                    const selectedSvc = servicesList.find(s => s.id === e.target.value || s.code === e.target.value);
                    if (selectedSvc) {
                      handleLoadService(selectedSvc);
                    }
                  }}
                >
                  <option value="">-- Kies een bestaande dienst als basis --</option>
                  <optgroup label="🎙️ Voice Diensten">
                    {servicesList.filter(s => s.category !== 'data').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) {s.isBuiltIn ? '[Ingebouwd]' : '[Eigen template]'}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Data Diensten">
                    {servicesList.filter(s => s.category === 'data').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) {s.isBuiltIn ? '[Ingebouwd]' : '[Eigen template]'}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Selecteer een bestaande dienst om de volledige netwerktopologie direct op het canvas te laden.
                </p>
              </div>

              {/* KEUZE TUSSEN VOICE OF DATA TEMPLATE */}
              <div className="space-y-1.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Netwerktemplate Type
                </span>
                <div className={`p-1 rounded-xl border grid grid-cols-2 gap-1 text-xs font-bold ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('voice')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      templateCategory === 'voice'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>🎙️ Voice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('data')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      templateCategory === 'data'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>🌐 Data</span>
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                  </button>
                </div>
              </div>

<<<<<<< HEAD
=======
              {/* Elementen Palet: Aangepast op basis van gekozen categorie (Voice of Data) */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  1. Elementen Toevoegen {templateCategory ? `(${templateCategory === 'data' ? 'Data Netwerk' : 'Voice Netwerk'})` : ''}
                </span>
                
                {templateCategory === null ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center space-y-2 ${
                    darkMode ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Kies een type</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Selecteer <strong className="text-blue-600 dark:text-blue-400">🎙️ Voice</strong> of <strong className="text-blue-600 dark:text-blue-400">🌐 Data</strong> hierboven om te beginnen.
                    </p>
                  </div>
                ) : templateCategory === 'voice' ? (
                  /* VOICE ELEMENTEN */
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Router */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('router')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <Network className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Router</span>
                      <span className="text-[9px] text-slate-400 leading-none">Core / IP</span>
                    </button>

                    {/* 2. Mediant */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('mediant')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                        <Server className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Mediant</span>
                      <span className="text-[9px] text-slate-400 leading-none">AudioCodes CPE</span>
                    </button>

                    {/* 3. Customer LAN Wolk */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('cloud')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">LAN Wolk</span>
                      <span className="text-[9px] text-slate-400 leading-none">Customer LAN</span>
                    </button>

                    {/* 4. SIP PBX */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('pbx')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">SIP PBX</span>
                      <span className="text-[9px] text-slate-400 leading-none">Telefooncentrale</span>
                    </button>

                    {/* 5. Firewall */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('firewall')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                      title="Firewall: intern onbekend terrein (klantbeheer). Terminerend adres bevindt zich vóór de firewall."
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Firewall</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold leading-none">Term. vóór FW</span>
                    </button>

                    {/* 6. Telefoontoestel */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('phone')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Telefoontoestel</span>
                      <span className="text-[9px] text-slate-400 leading-none">IP Endpoint</span>
                    </button>

                    {/* 7. Connectoren: Keuze uit Recht, Haaks of Vloeiend */}
                    <div className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1 px-0.5">
                        <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                          <Split className="w-3.5 h-3.5" />
                        </div>
                        <div className="leading-tight text-left">
                          <span className="text-xs font-bold block leading-tight">Connector</span>
                          <span className="text-[9px] text-slate-400 block leading-none">Kies tracé:</span>
                        </div>
                      </div>

                      {(() => {
                        const activeShape = selectedElement?.type === 'connector' 
                          ? (selectedElement.connectorShape || 'straight') 
                          : defaultConnectorShape;
                        return (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('straight')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'straight'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector recht maken' : 'Rechte connector toevoegen'}
                            >
                              <span className="text-xs font-black">─</span>
                              <span>Recht</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('orthogonal')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'orthogonal'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector haaks (90°) maken' : 'Haakse connector (90° bochten) toevoegen'}
                            >
                              <span className="text-xs font-black">┌┘</span>
                              <span>Haaks</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('curved')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'curved'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector vloeiend (boog) maken' : 'Vloeiende connector (soepele boog) toevoegen'}
                            >
                              <span className="text-xs font-black">~</span>
                              <span>Vloeiend</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 8. Tekstveldjes */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('text')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
                        <Type className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Tekstveld</span>
                      <span className="text-[9px] text-slate-400 leading-none">Direct typen</span>
                    </button>
                  </div>
                ) : (
                  /* DATA ELEMENTEN */
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Switch */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('switch')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <Network className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Switch</span>
                      <span className="text-[9px] text-slate-400 leading-none">L2 / L3 Core</span>
                    </button>

                    {/* 2. Data Router */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('router')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                        <Server className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Data Router</span>
                      <span className="text-[9px] text-slate-400 leading-none">WAN Gateway</span>
                    </button>

                    {/* 3. Firewall */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('firewall')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                      title="Next-Gen Firewall / Security Gateway"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Firewall</span>
                      <span className="text-[9px] text-red-600 dark:text-red-400 font-semibold leading-none">Security Appliance</span>
                    </button>

                    {/* 4. Internet / WAN Wolk */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('cloud')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Internet Wolk</span>
                      <span className="text-[9px] text-slate-400 leading-none">WAN / Cloud</span>
                    </button>

                    {/* 5. Server */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('server')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Server</span>
                      <span className="text-[9px] text-slate-400 leading-none">App / Data Center</span>
                    </button>

                    {/* 6. Access Point (WiFi) */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('access-point')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Access Point</span>
                      <span className="text-[9px] text-slate-400 leading-none">WiFi / Draadloos</span>
                    </button>

                    {/* 8. Connectoren: Keuze uit Recht, Haaks of Vloeiend */}
                    <div className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1 px-0.5">
                        <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                          <Split className="w-3.5 h-3.5" />
                        </div>
                        <div className="leading-tight text-left">
                          <span className="text-xs font-bold block leading-tight">Connector</span>
                          <span className="text-[9px] text-slate-400 block leading-none">Kies tracé:</span>
                        </div>
                      </div>

                      {(() => {
                        const activeShape = selectedElement?.type === 'connector' 
                          ? (selectedElement.connectorShape || 'straight') 
                          : defaultConnectorShape;
                        return (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('straight')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'straight'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector recht maken' : 'Rechte connector toevoegen'}
                            >
                              <span className="text-xs font-black">─</span>
                              <span>Recht</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('orthogonal')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'orthogonal'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector haaks (90°) maken' : 'Haakse connector (90° bochten) toevoegen'}
                            >
                              <span className="text-xs font-black">┌┘</span>
                              <span>Haaks</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleChooseConnectorShape('curved')}
                              className={`py-1 px-0.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-[1.03] ${
                                activeShape === 'curved'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={selectedElement?.type === 'connector' ? 'Geselecteerde connector vloeiend (boog) maken' : 'Vloeiende connector (soepele boog) toevoegen'}
                            >
                              <span className="text-xs font-black">~</span>
                              <span>Vloeiend</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 9. Tekstveld */}
                    <button
                      type="button"
                      onClick={() => handleAddElement('text')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-[1.02] ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
                        <Type className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Tekstveld</span>
                      <span className="text-[9px] text-slate-400 leading-none">Direct typen</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Uitvraagscenario snelle status banner */}
              <div 
                onClick={() => setActiveTab('scenario')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                  darkMode ? 'bg-blue-950/20 border-blue-800/40 hover:bg-blue-950/40' : 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/70 shadow-2xs'
                }`}
                title="Klik om het automatisch gegenereerde uitvraagscenario te bekijken"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <span>Uitvraagscenario</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono font-bold">
                        {currentScenario.questions.filter(q => q.category !== 'general').length} IP
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Klantnaam, Projectnr. &amp; Locaties
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  Bekijk &rarr;
                </span>
              </div>

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
              {/* Geselecteerd Element Eigenschappen & Formaat Verstellen */}
              <ServiceBuilderPropertiesPanel
                selectedIds={selectedIds}
                selectedElement={selectedElement || null}
                elements={elements}
                darkMode={darkMode}
<<<<<<< HEAD
=======
                templateCategory={templateCategory}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                handleDeleteSelected={handleDeleteSelected}
                handleDuplicateElement={handleDuplicateElement}
                handleDeleteElement={handleDeleteElement}
                updateElement={updateElement}
                adjustElementScale={adjustElementScale}
                getTargetName={getTargetName}
<<<<<<< HEAD
=======
                onOpenScenarioTab={() => setActiveTab('scenario')}
                onAddBehindFirewall={handleAddBehindFirewall}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
              />

            </div>

            {/* RECHTERKANVAS & STUDIOGEDEELTE */}
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Studio Canvas Bovenbalk */}
              <div className={`px-4 py-2 border-b flex items-center justify-between shrink-0 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Canvas</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({elements.length} elementen geplaatst{selectedIds.length > 1 ? ` • ${selectedIds.length} geselecteerd (Shift)` : ''})
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom Knoppen: In- en Uitzoomen & 100% Reset */}
                  <div className={`flex items-center rounded-lg border p-0.5 shadow-2xs ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.4}
                      className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Uitzoomen (Zoom -)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                      title="Klik om zoom te herstellen naar 100%"
                    >
                      {Math.round(zoom * 100)}%
                    </button>

                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={zoom >= 2.5}
                      className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Inzoomen (Zoom +)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
<<<<<<< HEAD
                      title="Herstel zoom (100%)"
=======
                      title="Herstel weergave (100% zoom en positie)"
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCanvas}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Herstel naar basisopzet"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Canvas Leegmaken</span>
                  </button>
                </div>
              </div>

<<<<<<< HEAD
              {/* HET CANVAS: IP Voice Access Network altijd exact zoals in alle bestaande designs */}
              <div 
                ref={canvasCallbackRef}
                tabIndex={0}
                className="flex-1 relative overflow-auto select-none cursor-default outline-none bg-radial from-slate-200/40 to-slate-200/10 dark:from-slate-900/60 dark:to-slate-950"
=======
              {/* HET CANVAS: IP Voice Access Network - met drag-to-pan op een vrij stuk canvas */}
              <div 
                ref={canvasCallbackRef}
                tabIndex={0}
                className={`flex-1 relative overflow-hidden select-none outline-none bg-radial from-slate-200/40 to-slate-200/10 dark:from-slate-900/60 dark:to-slate-950 transition-colors ${
                  isPanning ? 'cursor-grabbing' : 'cursor-grab'
                }`}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                style={{
                  backgroundImage: darkMode 
                    ? 'radial-gradient(#334155 1px, transparent 1px)' 
                    : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
<<<<<<< HEAD
                  backgroundSize: '20px 20px'
                }}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={() => {
                  if (!dragState.hasMoved) {
                    setSelectedIds([]);
                  }
                }}
=======
                  backgroundSize: '20px 20px',
                  backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
              >
                <div
                  ref={innerCanvasRef}
                  style={{
<<<<<<< HEAD
                    transform: `scale(${zoom})`,
=======
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                    transformOrigin: 'top center',
                    width: '100%',
                    minWidth: '960px',
                    minHeight: '620px',
                    position: 'relative',
<<<<<<< HEAD
                    height: '100%'
                  }}
                >

                {/* 1. STANDAARD IP VOICE ACCESS NETWORK ELLIPSE (Altijd aanwezig conform elk bestaand netwerkdesign) */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 top-4 w-[92%] max-w-[960px] h-[120px] border border-blue-500 border-dashed rounded-[100%] flex items-center justify-center z-10 shadow-xs pointer-events-none transition-all ${
                    activeSnapTargetId === 'ip-voice-cloud' ? 'ring-4 ring-emerald-400/80 bg-blue-200/60' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'rgba(147, 197, 253, 0.35)'
                  }}
                >
                  {/* Grote gecentreerde titel exact conform designs */}
                  <span className="text-2xl sm:text-4xl text-slate-800 dark:text-slate-700 font-light select-none pointer-events-none tracking-tight">
                    IP Voice Access Network
                  </span>

                  {/* STANDAARD SBC CLUSTER IN DE IP VOICE ACCESS NETWORK (Exact links geplaatst zoals in de designs) */}
                  <div 
                    className={`absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center select-none z-20 pointer-events-auto rounded-lg transition-all ${
                      activeSnapTargetId === 'sbc-cluster-fixed' ? 'ring-4 ring-emerald-400 p-1 bg-white/50' : ''
                    }`}
                    title="SBC Cluster (AudioCodes Mediant™ 4000B) - Standaard in IP Voice Access Network"
                  >
                    <div className="relative drop-shadow-md">
                      <SbcClusterSvg width={200} height={40} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 bg-transparent px-1 py-0.5 whitespace-nowrap mt-1 select-none">
                      SBC Cluster
                    </span>
                  </div>
                </div>

                {/* 2. STANDAARD ROUTER: EXACT IN HET MIDDEN TEGEN DE ONDERSTE RAND VAN HET IP VOICE ACCESS NETWORK (Conform design, ZONDER Core Router titel) */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 top-[126px] flex flex-col items-center select-none z-20 pointer-events-auto rounded-lg transition-all ${
                    activeSnapTargetId === 'core-router-fixed' ? 'ring-4 ring-emerald-400 p-1 bg-white/50' : ''
                  }`}
                >
                  <div className="relative drop-shadow-md">
                    <CoreRouterSvg width={100} height={40} />
                  </div>
                </div>
=======
                    height: '100%',
                    willChange: isPanning ? 'transform' : 'auto'
                  }}
                >

                {/* 0. KEUZESCHERM OP CANVAS ALS ER NOG GEEN TEMPLATE CATEGORIE IS GEKOZEN */}
                {templateCategory === null && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 p-6 pointer-events-auto">
                    <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                          Kies netwerktemplate type
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Selecteer een categorie om een nieuw sjabloon op het canvas te ontwerpen
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory('voice')}
                          className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                        >
                          <span className="text-2xl">🎙️</span>
                          <span>Voice Template</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-300 font-normal">Met IP Voice wolk & SBC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory('data')}
                          className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                        >
                          <span className="text-2xl">🌐</span>
                          <span>Data Template</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-normal">Routers, Switches & LAN</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. STANDAARD IP VOICE ACCESS NETWORK ELLIPSE & SBC CLUSTER & ROUTER (Alleen aanwezig bij Voice template) */}
                {templateCategory === 'voice' && (
                  <>
                    {(() => {
                      const cloudW = Math.min(canvasWidth - 60, 840);
                      const cloudH = 140;
                      return (
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center justify-center z-10 pointer-events-none"
                          style={{ width: `${cloudW}px`, height: `${cloudH}px` }}
                        >
                          <svg 
                            width={cloudW} 
                            height={cloudH} 
                            viewBox={`0 0 ${cloudW} ${cloudH}`} 
                            className="absolute inset-0 overflow-visible pointer-events-none"
                          >
                            <defs>
                              <linearGradient id="sbIpVoiceCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.85" />
                              </linearGradient>
                            </defs>
                            <path 
                              d={generateCloudPath(cloudW, cloudH)} 
                              fill={activeSnapTargetId === 'ip-voice-cloud' ? '#a7f3d0' : 'url(#sbIpVoiceCloudGrad)'}
                              stroke={activeSnapTargetId === 'ip-voice-cloud' ? '#059669' : '#2563eb'} 
                              strokeWidth={activeSnapTargetId === 'ip-voice-cloud' ? '3.5' : '2.5'} 
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.15))' }}
                            />
                          </svg>

                          {/* Grote gecentreerde titel exact conform designs met voldoende marge vanaf het SBC Cluster */}
                          <div className="absolute inset-y-0 left-[210px] right-6 flex items-center justify-center pointer-events-none z-15">
                            <span className="text-2xl sm:text-3xl md:text-4xl text-slate-800 dark:text-slate-700 font-light select-none tracking-tight text-center">
                              IP Voice Access Network
                            </span>
                          </div>

                          {/* STANDAARD SBC CLUSTER IN DE IP VOICE ACCESS NETWORK (Exact links geplaatst zonder overlap) */}
                          <div 
                            className={`absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center select-none z-20 pointer-events-auto rounded-lg transition-all ${
                              activeSnapTargetId === 'sbc-cluster-fixed' ? 'ring-4 ring-emerald-400 p-1 bg-white/50' : ''
                            }`}
                            title="SBC Cluster (AudioCodes Mediant™ 4000B) - Standaard in IP Voice Access Network"
                          >
                            <div className="relative drop-shadow-md">
                              <SbcClusterSvg width={175} height={35} />
                            </div>
                            <span className="text-xs font-bold text-slate-800 bg-transparent px-1 py-0.5 whitespace-nowrap mt-1 select-none">
                              SBC Cluster
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24

                {/* CONNECTOREN TEKENEN ALS VRIJE SVG LIJNEN MET MAGNETISCHE TERMINATIE AAN ELEMENTEN */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible">
                  {elements.filter(el => el.type === 'connector').map(el => {
                    const isSelected = selectedIds.includes(el.id);
                    const { p1, p2 } = getConnectorEndpoints(el, elements, canvasWidth);
                    const rawX1 = p1.x;
                    const rawY1 = p1.y;
                    const rawX2 = p2.x;
                    const rawY2 = p2.y;

<<<<<<< HEAD
                    const strokeDash = el.lineStyle === 'dashed' ? '6,6' : el.lineStyle === 'dotted' ? '2,4' : undefined;
                    const strokeW = el.strokeWidth || 2.5;
                    const strokeCol = el.color || '#2563eb';

                    return (
                      <g key={`svg-line-${el.id}`}>
                        {/* Onzichtbare bredere klik-lijn voor makkelijk selecteren */}
                        <line
                          x1={rawX1}
                          y1={rawY1}
                          x2={rawX2}
                          y2={rawY2}
                          stroke="transparent"
                          strokeWidth={20}
                          className="pointer-events-auto cursor-pointer"
                          onMouseDown={(e) => handleMouseDownElement(el.id, e)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (dragState.hasMoved) return;
                            if (e.shiftKey) {
                              setSelectedIds(prev => prev.includes(el.id) ? prev.filter(x => x !== el.id) : [...prev, el.id]);
                            } else {
                              setSelectedIds([el.id]);
                            }
                          }}
                        />
                        {/* De effectieve connectorlijn die ALTIJD strak op de buitenrand aansluit */}
                        <line
                          x1={rawX1}
                          y1={rawY1}
                          x2={rawX2}
                          y2={rawY2}
=======
                    const shape = el.connectorShape || 'straight';
                    const { pathData } = getConnectorPath(p1, p2, shape);

                    const strokeDash = el.lineStyle === 'dashed' ? '6,6' : el.lineStyle === 'dotted' ? '2,4' : undefined;
                    const strokeW = el.strokeWidth || 2.5;
                    const strokeCol = el.color || '#2563eb';
                    const p1Connected = Boolean(el.sourceElementId);
                    const p2Connected = Boolean(el.targetElementId);
                    const isPlacedBetweenTwoElements = p1Connected && p2Connected;

                    return (
                      <g key={`svg-line-${el.id}`}>
                        {/* Onzichtbare bredere klik- en sleeplijn om de connector in zijn geheel te verplaatsen */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={24}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-auto cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedIds([el.id]);
                            setSelectedId(el.id);
                            handleMouseDownElement(el.id, e);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIds([el.id]);
                            setSelectedId(el.id);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteElement(el.id);
                          }}
                        >
                          <title>Sleep om de hele connector te verplaatsen, of klik om te selecteren en tracé te wijzigen</title>
                        </path>
                        {/* De effectieve connectorlijn die ALTIJD strak op de buitenrand aansluit */}
                        <path
                          d={pathData}
                          fill="none"
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                          stroke={strokeCol}
                          strokeWidth={strokeW}
                          strokeDasharray={strokeDash}
                          strokeLinecap="round"
<<<<<<< HEAD
                          className={`pointer-events-none ${isSelected ? 'drop-shadow-md' : ''}`}
                        />
                        {/* Subtiel contactpuntje aan begin en eind in SVG: ALLEEN zichtbaar als connector geselecteerd is of versleept wordt! */}
                        {(isSelected || dragState.activeId === el.id) && (
                          <>
                            <circle
                              cx={rawX1}
                              cy={rawY1}
                              r={Math.max(2.4, strokeW * 0.9)}
                              fill={strokeCol}
                            />
                            <circle
                              cx={rawX2}
                              cy={rawY2}
                              r={Math.max(2.4, strokeW * 0.9)}
                              fill={strokeCol}
                            />
=======
                          strokeLinejoin="round"
                          className={`pointer-events-none ${isSelected ? 'drop-shadow-md' : ''}`}
                        />
                        {/* Subtiel contactpuntje aan begin en eind in SVG: ALLEEN zichtbaar als connector los hangt (niet aangesloten tussen twee elementen) */}
                        {(isSelected || dragState.activeId === el.id) && !isPlacedBetweenTwoElements && (
                          <>
                            {!p1Connected && (
                              <circle
                                cx={rawX1}
                                cy={rawY1}
                                r={Math.max(2.4, strokeW * 0.9)}
                                fill={strokeCol}
                              />
                            )}
                            {!p2Connected && (
                              <circle
                                cx={rawX2}
                                cy={rawY2}
                                r={Math.max(2.4, strokeW * 0.9)}
                                fill={strokeCol}
                              />
                            )}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* VRIJE ELEMENTEN OP HET CANVAS (Verstelbaar in grootte & positie) */}
<<<<<<< HEAD
                {elements.map(el => {
                  const isSelected = selectedIds.includes(el.id);
                  const scale = el.scale || 1;
                  const isSnapTarget = activeSnapTargetId === el.id;
=======
                {(() => {
                  const canvasHeight = innerCanvasRef.current?.clientHeight || canvasRef.current?.clientHeight || 700;
                  return elements.map(el => {
                    const isSelected = selectedIds.includes(el.id);
                    const scale = el.scale || 1;
                    const isSnapTarget = activeSnapTargetId === el.id;
                    const isHardware = ['mediant', 'router', 'firewall', 'pbx', 'sbc', 'phone', 'switch', 'server', 'access-point'].includes(el.type);
                    const placement = isHardware ? calculateOptimalBadgesPlacement(el, elements, canvasWidth, canvasHeight) : null;
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24

                  // Connectoren hebben hun eigen SVG renderer met 2 afzonderlijk sleepbare contactpuntjes
                  if (el.type === 'connector') {
                    const { p1, p2 } = getConnectorEndpoints(el, elements, canvasWidth);
<<<<<<< HEAD
                    const strokeW = el.strokeWidth || 2.5;
                    const strokeCol = el.color || '#2563eb';
                    const dotSize = Math.max(5, strokeW * 1.8);

                    return (
                      <React.Fragment key={el.id}>
                        {/* Middelpunt selectiebox */}
                        {isSelected && (
                          <div
                            style={{
                              left: Math.round((p1.x + p2.x) / 2),
                              top: Math.round((p1.y + p2.y) / 2),
                              transform: 'translate(-50%, -50%)',
                              zIndex: 35
                            }}
                            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing p-1 bg-white/95 dark:bg-slate-900/95 rounded border border-blue-400 shadow-xs flex items-center gap-1.5"
                            onMouseDown={(e) => handleMouseDownElement(el.id, e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (dragState.hasMoved) return;
                              if (e.shiftKey) {
                                setSelectedIds(prev => prev.includes(el.id) ? prev.filter(x => x !== el.id) : [...prev, el.id]);
                              } else {
                                setSelectedIds([el.id]);
                              }
                            }}
                          >
                            <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 font-mono">
                              Connector
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteElement(el.id);
                              }}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                              title="Connector verwijderen (DEL)"
                            >
                              <Trash2 className="w-3 h-3" />
=======
                    const shape = el.connectorShape || 'straight';
                    const { midPoint } = getConnectorPath(p1, p2, shape);
                    const strokeW = el.strokeWidth || 2.5;
                    const strokeCol = el.color || '#2563eb';
                    const p1Connected = Boolean(el.sourceElementId);
                    const p2Connected = Boolean(el.targetElementId);
                    const isPlacedBetweenTwoElements = p1Connected && p2Connected;
                    const isDraggingP1 = dragState.activeId === el.id && dragState.dragMode === 'endpoint1';
                    const isDraggingP2 = dragState.activeId === el.id && dragState.dragMode === 'endpoint2';

                    return (
                      <React.Fragment key={el.id}>
                        {/* Middelpunt actiebalk met directe tracékeuze (Recht, Haaks, Vloeiend) en vuilnisemmer */}
                        {isSelected && (
                          <div
                            style={{
                              left: midPoint.x,
                              top: midPoint.y,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 50
                            }}
                            className="absolute pointer-events-auto p-1 bg-white dark:bg-slate-900 rounded-lg border-2 border-blue-500 shadow-xl flex items-center gap-1.5 select-none ring-4 ring-blue-500/15"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {/* Tracé knoppen: Recht, Haaks, Vloeiend */}
                            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                              <button
                                type="button"
                                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateElement(el.id, { connectorShape: 'straight' });
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  shape === 'straight'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Rechte directe lijn"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="3" y1="20" x2="21" y2="4" />
                                </svg>
                                <span>Recht</span>
                              </button>

                              <button
                                type="button"
                                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateElement(el.id, { connectorShape: 'orthogonal' });
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  shape === 'orthogonal'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Haakse bochten (90° hoeken)"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M 3 20 L 12 20 L 12 4 L 21 4" />
                                </svg>
                                <span>Haaks</span>
                              </button>

                              <button
                                type="button"
                                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateElement(el.id, { connectorShape: 'curved' });
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  shape === 'curved'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Vloeiende soepele boog"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M 3 20 C 12 20, 12 4, 21 4" />
                                </svg>
                                <span>Vloeiend</span>
                              </button>
                            </div>

                            {/* Directe Verwijderknop */}
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteElement(el.id);
                              }}
                              className="p-1.5 rounded-md bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-400 cursor-pointer shadow-2xs"
                              title="Connector direct verwijderen (of druk op toets DEL)"
                            >
                              <Trash2 className="w-4 h-4" />
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                            </button>
                          </div>
                        )}

<<<<<<< HEAD
                        {/* EINDPUNTEN 1 & 2: Alleen zichtbaar als connector geselecteerd is of versleept wordt! */}
                        {(isSelected || dragState.activeId === el.id) && (
                          <>
                            {/* EINDPUNT 1: SUBTIEL CONTACTPUNT IETS DIKKER DAN DE CONNECTOR ZELF */}
                            <div
                              style={{
                                left: p1.x,
                                top: p1.y,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 40
                              }}
                              className="absolute w-5 h-5 flex items-center justify-center cursor-crosshair pointer-events-auto group/handle"
                              onMouseDown={(e) => handleMouseDownConnectorEnd(el.id, 1, e)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!dragState.hasMoved) setSelectedId(el.id);
                              }}
                              title={`Beginpunt connector ${el.sourceElementId ? `(Aangesloten op buitenrand: ${getTargetName(el.sourceElementId)})` : '(Sleep naar de buitenrand van een element)'}`}
                            >
                              <div 
                                style={{
                                  width: dotSize,
                                  height: dotSize,
                                  backgroundColor: strokeCol
                                }}
                                className="rounded-full ring-1 ring-white/90 dark:ring-slate-900 shadow-2xs transition-transform group-hover/handle:scale-135"
                              />
                            </div>

                            {/* EINDPUNT 2: SUBTIEL CONTACTPUNT IETS DIKKER DAN DE CONNECTOR ZELF */}
                            <div
                              style={{
                                left: p2.x,
                                top: p2.y,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 40
                              }}
                              className="absolute w-5 h-5 flex items-center justify-center cursor-crosshair pointer-events-auto group/handle"
                              onMouseDown={(e) => handleMouseDownConnectorEnd(el.id, 2, e)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!dragState.hasMoved) setSelectedId(el.id);
                              }}
                              title={`Eindpunt connector ${el.targetElementId ? `(Aangesloten op buitenrand: ${getTargetName(el.targetElementId)})` : '(Sleep naar de buitenrand van een element)'}`}
                            >
                              <div 
                                style={{
                                  width: dotSize,
                                  height: dotSize,
                                  backgroundColor: strokeCol
                                }}
                                className="rounded-full ring-1 ring-white/90 dark:ring-slate-900 shadow-2xs transition-transform group-hover/handle:scale-135"
                              />
                            </div>
                          </>
                        )}
=======
                        {/* EINDPUNTEN 1 & 2: Wanneer aangesloten tussen twee elementen verdwijnen de dikke punten! Alleen bij hover/selectie subtiel herpositioneerbaar */}
                        <>
                          {/* EINDPUNT 1: BEGINPUNT CONNECTOR */}
                          <div
                            style={{
                              left: p1.x,
                              top: p1.y,
                              zIndex: 60
                            }}
                            className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center cursor-crosshair pointer-events-auto group/handle"
                            onMouseDown={(e) => handleMouseDownConnectorEnd(el.id, 1, e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds([el.id]);
                              setSelectedId(el.id);
                            }}
                            title={`Beginpunt connector ${el.sourceElementId ? `(Aangesloten op: ${getTargetName(el.sourceElementId)})` : '(Sleep naar de rand van een element)'}`}
                          >
                            {/* Dikke punt verdwijnt zodra aangesloten op een element! */}
                            {(!p1Connected || isDraggingP1) && (
                              <div 
                                style={{
                                  width: isSelected ? 10 : 8,
                                  height: isSelected ? 10 : 8,
                                  backgroundColor: isSelected ? '#ffffff' : strokeCol,
                                  borderColor: strokeCol
                                }}
                                className={`rounded-full transition-all ${
                                  isDraggingP1
                                    ? 'border-2 ring-2 ring-blue-500/60 shadow-md opacity-100 scale-125'
                                    : 'border-[2px] ring-1 ring-white/90 dark:ring-slate-900 opacity-90 group-hover/handle:opacity-100 shadow-xs'
                                }`}
                              />
                            )}
                          </div>

                          {/* EINDPUNT 2: EINDPUNT CONNECTOR */}
                          <div
                            style={{
                              left: p2.x,
                              top: p2.y,
                              zIndex: 60
                            }}
                            className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center cursor-crosshair pointer-events-auto group/handle"
                            onMouseDown={(e) => handleMouseDownConnectorEnd(el.id, 2, e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds([el.id]);
                              setSelectedId(el.id);
                            }}
                            title={`Eindpunt connector ${el.targetElementId ? `(Aangesloten op: ${getTargetName(el.targetElementId)})` : '(Sleep naar de rand van een element)'}`}
                          >
                            {/* Dikke punt verdwijnt zodra aangesloten op een element! */}
                            {(!p2Connected || isDraggingP2) && (
                              <div 
                                style={{
                                  width: isSelected ? 10 : 8,
                                  height: isSelected ? 10 : 8,
                                  backgroundColor: isSelected ? '#ffffff' : strokeCol,
                                  borderColor: strokeCol
                                }}
                                className={`rounded-full transition-all ${
                                  isDraggingP2
                                    ? 'border-2 ring-2 ring-blue-500/60 shadow-md opacity-100 scale-125'
                                    : 'border-[2px] ring-1 ring-white/90 dark:ring-slate-900 opacity-90 group-hover/handle:opacity-100 shadow-xs'
                                }`}
                              />
                            )}
                          </div>
                        </>
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                      </React.Fragment>
                    );
                  }

                  // Overige elementen (Router, Mediant, Cloud, PBX, Firewall, Phone, Text)
                  return (
                    <div
                      key={el.id}
                      style={{
                        top: el.y,
                        left: el.x,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 35 : 20
                      }}
                      className={`absolute cursor-grab active:cursor-grabbing group transition-shadow select-none rounded-lg ${
                        isSnapTarget 
                          ? 'ring-4 ring-emerald-400 ring-offset-2 bg-emerald-50/30' 
                          : isSelected 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:ring-1 hover:ring-blue-400/60'
                      }`}
                      onMouseDown={(e) => handleMouseDownElement(el.id, e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dragState.hasMoved) return;
                        if (e.shiftKey) {
                          // Al verwerkt in onMouseDown
                        } else {
                          setSelectedId(el.id);
                        }
                      }}
                    >
                      {/* BINNENWERK VAN ELEMENT OP BASIS VAN TYPE */}

                      {/* A. ROUTER */}
                      {el.type === 'router' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <CoreRouterSvg width={96} height={38} />
<<<<<<< HEAD
                          {el.label && el.label !== 'Core Router' && (
                            <span className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded bg-blue-900 text-white shadow-xs font-mono">
                              {el.label}
                            </span>
                          )}
=======
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                        </div>
                      )}

                      {/* B. MEDIANT */}
                      {el.type === 'mediant' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <MediantRouterSvg width={96} height={38} />
<<<<<<< HEAD
                          {el.label && (
                            <span className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded bg-slate-900 text-white shadow-xs font-mono">
                              {el.label}
                            </span>
                          )}
                          <div className="flex gap-1 mt-0.5 text-[8px] font-mono">
                            <span className="bg-blue-100 text-blue-800 px-1 rounded">WAN</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1 rounded">LAN</span>
                          </div>
=======
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                        </div>
                      )}

                      {/* C. CUSTOMER LAN WOLK */}
                      {el.type === 'cloud' && (() => {
                        const cw = el.width || 360;
                        const ch = el.height || 90;
                        return (
                          <div className="relative p-1">
                            <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} className="overflow-visible drop-shadow-md">
                              <path d={generateCloudPath(cw, ch)} fill="#bfdbfe" stroke="#2563eb" strokeWidth="2" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[11px] font-bold text-blue-900 px-2 py-0.5 rounded bg-white/85 shadow-2xs">
                                {el.label || 'Customer LAN'}
                              </span>
<<<<<<< HEAD
                              <span className="text-[9px] text-blue-700/80 font-semibold mt-0.5">
                                (Subnet per klant)
                              </span>
=======
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                            </div>
                          </div>
                        );
                      })()}

                      {/* D. SIP PBX */}
                      {el.type === 'pbx' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <PbxSvg width={50} height={50} />
<<<<<<< HEAD
                          {el.label && (
                            <span className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded bg-amber-900 text-white shadow-xs font-mono">
                              {el.label}
                            </span>
                          )}
=======
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                        </div>
                      )}

                      {/* E. FIREWALL */}
                      {el.type === 'firewall' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <FirewallSvg width={54} height={40} />
<<<<<<< HEAD
                          {el.label && (
                            <span className="text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded bg-red-800 text-white shadow-2xs">
                              {el.label}
                            </span>
                          )}
                        </div>
                      )}

                      {/* F. TELEFOONHOORN - Alleen icoon, geen 'IP Phone' titel */}
                      {el.type === 'phone' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <PhoneSvg width={38} height={38} />
                          {el.label && el.label !== 'IP Phone' && (
                            <span className="text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded bg-slate-800 text-white shadow-2xs">
                              {el.label}
                            </span>
                          )}
                        </div>
                      )}

=======
                        </div>
                      )}

                      {/* F. TELEFOONTOESTEL - Alleen icoon */}
                      {el.type === 'phone' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <PhoneSvg width={38} height={38} />
                        </div>
                      )}

                      {/* G. SWITCH */}
                      {el.type === 'switch' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <SwitchSvg width={96} height={36} />
                        </div>
                      )}

                      {/* H. SERVER */}
                      {el.type === 'server' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <ServerSvg width={76} height={42} />
                        </div>
                      )}

                      {/* I. ACCESS POINT */}
                      {el.type === 'access-point' && (
                        <div className="flex flex-col items-center p-1" style={{ transform: `scale(${scale})` }}>
                          <AccessPointSvg width={44} height={44} />
                        </div>
                      )}

                      {/* SLIMME OVERLAPVRIJE NAAM- EN IP-ADRES VELDJES (FLEXIBEL GEPOSITIONEERD) */}
                      <ServiceElementBadges
                        el={el}
                        placement={placement}
                        updateElement={updateElement}
                        elements={elements}
                        templateCategory={templateCategory}
                        onSelect={() => {
                          setSelectedIds([el.id]);
                          setSelectedId(el.id);
                        }}
                      />

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                      {/* G. TEKSTVELD OP MAAT: PAST ZICH DYNAMISCH AAN DE INGEVULDE TEKST AAN */}
                      {el.type === 'text' && (() => {
                        const styleClass = 
                          el.badgeStyle === 'card' 
                            ? 'bg-white text-slate-800 border border-slate-300 shadow-sm'
                            : el.badgeStyle === 'transparent'
                            ? 'bg-transparent text-slate-800 dark:text-slate-200'
                            : el.badgeStyle === 'badge-gray'
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : el.badgeStyle === 'badge-yellow'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                            : el.badgeStyle === 'badge-red'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : el.badgeStyle === 'badge-green'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs';

                        const fontClass = 
                          el.fontSize === 'xs' ? 'text-[10px]' :
                          el.fontSize === 'lg' ? 'text-sm font-bold' :
                          el.fontSize === 'base' ? 'text-xs font-semibold' : 'text-[11px] font-medium';

                        const alignClass = 
                          el.textAlign === 'left' ? 'text-left' :
                          el.textAlign === 'right' ? 'text-right' : 'text-center';

                        const textVal = el.customText ?? '';

                        return (
                          <div 
                            style={{ 
                              transform: `scale(${scale})`,
                              width: el.width ? `${el.width}px` : undefined,
                              minWidth: '48px',
                              maxWidth: '480px'
                            }}
                            className={`px-3 py-1.5 rounded-lg inline-flex items-center justify-center transition-all ${styleClass} ${fontClass}`}
                          >
                            <div className="grid w-full relative">
                              {/* Onzichtbare meet-span die de container exact laat meeschalen met de inhoud */}
                              <span 
                                className={`invisible col-start-1 row-start-1 whitespace-pre-wrap break-words leading-tight select-none pointer-events-none ${alignClass}`}
                                aria-hidden="true"
                              >
                                {(textVal || 'Typ tekst...') + '\u00A0'}
                              </span>

                              {isSelected ? (
                                <textarea
                                  value={textVal}
                                  onChange={(e) => updateElement(el.id, { customText: e.target.value })}
                                  placeholder="Typ tekst..."
                                  rows={1}
                                  className={`col-start-1 row-start-1 w-full h-full overflow-hidden bg-transparent border-0 outline-none resize-none p-0 focus:ring-0 leading-tight ${alignClass}`}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className={`col-start-1 row-start-1 select-none pointer-events-none whitespace-pre-wrap break-words leading-tight ${alignClass}`}>
                                  {textVal || 'Tekstveld'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* HOEKGREEP OM FORMAAT AAN TE PASSEN */}
                      {isSelected && (
                        <div
                          onMouseDown={(e) => handleMouseDownResize(el.id, e)}
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-md z-40 transition-transform hover:scale-120"
                          title="Sleep om het formaat van dit element aan te passen"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
<<<<<<< HEAD
                })}
=======
                });
              })()}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24

                </div>
              </div>

              {/* Onderbalk: Naam, code en opslaan */}
              <div className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
                darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
<<<<<<< HEAD
                  <div className="w-full sm:w-64">
=======
                  <div className="w-full sm:w-96 max-w-md">
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Dienstnaam
                    </label>
                    <input
                      type="text"
                      placeholder="Bijv. Hosted PBX Duplex"
                      value={serviceName}
                      onChange={e => setServiceName(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
<<<<<<< HEAD

                  <div className="w-32">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Korte Code / Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Bijv. HPBX"
                      maxLength={12}
                      value={serviceCode}
                      onChange={e => setServiceCode(e.target.value.toUpperCase())}
                      className={`w-full px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-lg border focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="hidden lg:block flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Korte Beschrijving
                    </label>
                    <input
                      type="text"
                      placeholder="Toelichting over topologie..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
=======
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {(() => {
                    const loadedCustomService = servicesList.find(s => s.id === loadedServiceId && !s.isBuiltIn);
                    if (loadedCustomService) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleRequestDelete(loadedCustomService)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Deze geopende template definitief verwijderen (vereist bevestiging)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Template Verwijderen</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Sluiten
                  </button>

<<<<<<< HEAD
                  <button
                    type="button"
                    onClick={handleSaveNewService}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Bevestigen &amp; Nieuwe Dienst Opslaan</span>
                  </button>
=======
                  {serviceName.trim().length > 0 && elements.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveNewService}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 animate-in fade-in duration-150"
                    >
                      <Check className="w-4 h-4" />
                      <span>{loadedServiceId && servicesList.some(s => s.id === loadedServiceId && !s.isBuiltIn) ? 'Wijzigingen Opslaan' : 'Bevestigen & Nieuwe Dienst Opslaan'}</span>
                    </button>
                  )}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
                </div>
              </div>

            </div>
          </div>
<<<<<<< HEAD
=======
        ) : activeTab === 'scenario' ? (
          <ServiceBuilderScenarioTab
            darkMode={darkMode}
            serviceName={serviceName}
            elements={elements}
            scenario={currentScenario}
            onUpdateScenario={(updated) => {
              if (typeof updated.includeLocations === 'boolean') {
                setIncludeLocations(updated.includeLocations);
              }
            }}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
        ) : (
          <SavedServicesTab
            darkMode={darkMode}
            servicesList={servicesList}
<<<<<<< HEAD
            setActiveTab={setActiveTab}
=======
            setActiveTab={(tab) => {
              if (tab === 'studio') {
                setLoadedServiceId(null);
              }
              setActiveTab(tab);
            }}
            onRequestDelete={handleRequestDelete}
            onLoadService={handleLoadService}
>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
            handleDeleteSaved={handleDeleteSaved}
          />
        )}

<<<<<<< HEAD
=======
        {/* Bevestigingsdialoog voor definitief verwijderen van een template */}
        <ConfirmDeleteTemplateModal
          isOpen={!!serviceToDelete}
          service={serviceToDelete}
          darkMode={darkMode}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        {/* Tekstveld Vraag / Prompt Modal bij toevoegen van een tekstveld in het design */}
        {showTextPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className={`w-full max-w-md p-5 rounded-2xl shadow-2xl border space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Tekstveld Toevoegen</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Voer een label of opmerking in voor op het canvas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTextPromptModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                  Label / Tekst inhoud *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={textPromptValue}
                  onChange={e => setTextPromptValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTextElement();
                    }
                  }}
                  placeholder="Bijv. Demarcatiepunt, Klantlocatie, Opmerking..."
                  className={`w-full px-3 py-2 text-sm rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />

                {/* Snelle suggestie badges */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">Snelle suggesties:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Demarcatiepunt', 'Klantlocatie', 'WAN Oplevering', 'IP-Adres Blok', 'Opmerking'].map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setTextPromptValue(sug);
                          handleAddTextElement(sug);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowTextPromptModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTextElement()}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Toevoegen op Canvas
                </button>
              </div>
            </div>
          </div>
        )}

>>>>>>> 8a0c9972348d611f55b3da403fc0605dbd3e2d24
      </div>
    </div>
  );
}
