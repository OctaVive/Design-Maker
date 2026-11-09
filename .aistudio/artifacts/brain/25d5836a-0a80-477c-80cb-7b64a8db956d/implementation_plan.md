# Automatic Access Router Height Adjustment to IP Voice Access Network

Automatic vertical positioning for access routers (Mediant CPEs, Voice Routers, and group routers) so that their top boundary seamlessly connects to the lower border of the top IP Voice Access Network cloud in both the primary Network Diagram and the Template Builder Studio for all voice services.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices:
> - **Attachment Target**: Access routers will vertically align and anchor directly against the bottom edge of the top **IP Voice Access Network** cloud ellipse.
> - **Scope**: Applies across both the **main Network Diagram** (`NetworkDiagram.tsx`) and the **Template Builder Studio** (`ServiceBuilderModal.tsx`) for voice service types.
> - **Cloud Geometry Rule**: The IP Voice Access Network cloud dimensions remain fixed and un-shifted; only the vertical position (`Y`) of the access routers / Mediant nodes will be adjusted to achieve the direct border alignment.

---

## 1. Overview & Core Concept

When rendering Voice services (`VOV`, `CN`, `VOV+CN`, `Multicustomer Esprit`, `Multicustomer IP Voice Group`, `Multicustomer Kinwel`, and custom voice templates), access routers (Mediant CPEs and access routers) must physically sit directly against the lower border of the top `IP Voice Access Network` cloud ellipse.

Instead of leaving a vertical gap or forcing manual dragging, the application will calculate the exact Y-position for the access routers based on the bottom boundary of the top cloud ellipse ($Y_{\text{cloud\_bottom}} = Y_{\text{cloud\_center}} + R_y$).

---

## 2. User Experience & Visual Design

- **Visual Alignment**: The top edge of Mediant CPE icons / access router icons touches or seamlessly connects to the bottom arc of the blue dashed `IP Voice Access Network` ellipse.
- **Zero Gap Between Core Cloud & Access Node**: Connector lines flow cleanly without floating gaps or awkward overlaps.
- **Preserved Custom Dragging**: Users can still manually drag elements on the canvas if desired, but the default layout automatically computes the flush position against the access cloud.
- **Template Builder & Main Diagram Parity**: Both studio templates and exported/generated network diagrams reflect the exact same vertical anchoring rule.

---

## 3. Key Product Decisions & Trade-Offs

- **Adjust Router Position, Keep Cloud Fixed**:
  - *Chosen Approach*: The IP Voice Access Network cloud geometry ($X, Y, W, H$) remains pristine and centered. The Y-coordinate of access routers is computed dynamically ($Y_{\text{router}} = Y_{\text{cloud\_bottom}} - \text{offset}$).
  - *Why*: Modifying cloud height or ellipse radius breaks the brand standard proportions of the IP Voice Access Network cloud.
- **Unified Math Across Main Diagram & Template Studio**:
  - *Chosen Approach*: Use a shared geometry helper or consistent border-touch formula across both `NetworkDiagram.tsx` (main view) and `ServiceBuilderModal.tsx` (studio view).

---

## 4. Technical Architecture & Data Strategy

### Visual System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IP Voice Access Network                            │
│  (Cloud Ellipse: Center Y = 76px, Ry = 58px -> Bottom Y = 134px)             │
│                                                                             │
│  [SBC Cluster]                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │ (Flush Contact Y = 134px)
                      ┌──────────────────────┐
                      │  Access / Mediant    │
                      │  CPE Router Node     │
                      └──────────────────────┘
                                  │
                      ┌──────────────────────┐
                      │    Customer LAN      │
                      │       Cloud          │
                      └──────────────────────┘
                                  │
                      ┌──────────────────────┐
                      │       SIP PBX        │
                      └──────────────────────┘
```

### Component Adjustments

1. **`src/components/diagram/diagramGeometry.ts` & `NetworkDiagram.tsx`**:
   - Update `ROUTER_Y` and `CPE_Y` calculation for voice services so access router Y positions align flush with `CORE_Y + 120` (the bottom boundary of the IP Voice Access Network ellipse).
2. **`src/components/ServiceBuilderModal.tsx`**:
   - Adjust `generateDefaultElementsForService` default `y` coordinates for `mediant` and `router` nodes in voice templates (`VOV`, `VOV+CN`, `Multicustomer`, etc.) from `y: 150` / `160` to the exact flush Y position (~`134px`–`136px`) touching the bottom arc of the IP Voice Access Network.
   - Adjust connector endpoints (`conn-vov-1`, `conn-vovcn-1`, `conn-m1-cloud`, `conn-m2-cloud`) so straight lines originate flush from the router base to the lower Customer LAN cloud.

---

## Next Steps

Please click **Proceed** (or reply to approve) to execute the implementation plan.
