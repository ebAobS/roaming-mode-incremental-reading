<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let points: Array<{ id: string; priority: number; title?: string }>
  export let currentId: string
  export let minPriority: number = 0
  export let maxPriority: number = 10
  export let height: number = 48
  export let orientation: "horizontal" | "vertical" = "horizontal"

  const axisLength = 800
  const displayMin = 0
  const displayMax = 10
  const dispatch = createEventDispatcher()

  $: crossSize = height
  $: viewBoxWidth = orientation === "horizontal" ? axisLength : crossSize + 40
  $: viewBoxHeight = orientation === "horizontal" ? crossSize + 16 : axisLength + 16

  const crossMap: Record<string, number> = {}
  function getCross(id: string) {
    if (!(id in crossMap)) {
      let hash = 0
      for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 9973
      crossMap[id] = 12 + (hash % Math.max(1, crossSize - 24))
    }
    return crossMap[id]
  }

  const priorityToAxis = (priority: number) => {
    const clamped = Math.min(displayMax, Math.max(displayMin, priority))
    const ratio = (clamped - displayMin) / (displayMax - displayMin)
    return orientation === "horizontal" ? ratio * axisLength : axisLength - ratio * axisLength
  }

  const axisToPriority = (axis: number) => {
    const ratio = orientation === "horizontal" ? axis / axisLength : 1 - axis / axisLength
    const value = ratio * (displayMax - displayMin) + displayMin
    return parseFloat(Math.min(maxPriority, Math.max(minPriority, value)).toFixed(2))
  }

  let dragging = false
  let dragAxis = 0
  let dragPriority = 0
  let draggingId = ""
  let dragStartOffset = 0

  let hoveringId = ""

  function onPointerDown(e: PointerEvent, point) {
    dragging = true
    draggingId = point.id

    const svgElement = (e.target as SVGElement).closest("svg")
    const rect = svgElement.getBoundingClientRect()

    const pointAxis = priorityToAxis(point.priority)
    const mouseAxis = orientation === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top

    dragStartOffset = mouseAxis - pointAxis
    dragAxis = pointAxis
    dragPriority = point.priority

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    e.stopPropagation()
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const svgElement = (e.target as SVGElement).closest("svg") || (document.querySelector("svg") as SVGElement)
    const rect = svgElement.getBoundingClientRect()

    let axisPos = (orientation === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top) - dragStartOffset
    axisPos = Math.max(0, Math.min(axisLength, axisPos))
    dragAxis = axisPos
    dragPriority = axisToPriority(axisPos)

    dispatch("dragging", { priority: dragPriority, id: draggingId })

    e.stopPropagation()
    e.preventDefault()
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return
    dispatch("change", { priority: dragPriority, id: draggingId })
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
    dragging = false
    draggingId = ""
    e.stopPropagation()
    e.preventDefault()
  }

  function onPointHover(point) {
    hoveringId = point.id
  }

  function onPointLeave() {
    hoveringId = ""
  }

  function onPointContextMenu(e: MouseEvent, point) {
    e.preventDefault()
    e.stopPropagation()
    if (dragging) return
    dispatch("openDocument", { id: point.id })
  }

  $: currentPoint = points.find((p) => p.id === currentId)
  $: currentPriority = dragging && draggingId === currentId ? dragPriority : currentPoint ? currentPoint.priority : 0
  $: currentAxis =
    dragging && draggingId === currentId ? dragAxis : currentPoint ? priorityToAxis(currentPoint.priority) : 0
  $: currentCross = currentPoint ? getCross(currentId) : crossSize / 2

  $: hoverPoint = points.find((p) => p.id === hoveringId)
</script>

<div style="margin: 12px 0;">
  <svg
    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    height={orientation === "horizontal" ? crossSize + 24 : axisLength + 24}
    style="display:block;overflow:visible;width:100%;"
  >
    <!-- 外框 -->
    <rect
      x="0"
      y="0"
      width={orientation === "horizontal" ? axisLength : crossSize}
      height={orientation === "horizontal" ? crossSize : axisLength}
      fill="none"
      stroke="#e0e0e0"
      stroke-width="1"
      rx="4"
    />

    <!-- 刻度 -->
    {#each Array.from({ length: 11 }, (_, i) => i) as tick}
      {@const pos = priorityToAxis(tick)}
      <line
        x1={orientation === "horizontal" ? pos : 0}
        y1={orientation === "horizontal" ? 0 : pos}
        x2={orientation === "horizontal" ? pos : crossSize}
        y2={orientation === "horizontal" ? crossSize : pos}
        stroke="#e0e0e0"
        stroke-width="1"
        opacity="0.6"
      />
      <text
        x={orientation === "horizontal" ? pos : crossSize + 12}
        y={orientation === "horizontal" ? crossSize + 16 : pos + 4}
        font-size="11"
        fill="#666"
        text-anchor={orientation === "horizontal" ? "middle" : "start"}
        font-weight="500"
      >
        {tick}
      </text>
    {/each}

    <!-- 其他文档点 -->
    {#each points as p (p.id)}
      {#if p.id !== currentId}
        {@const isThisDragging = dragging && draggingId === p.id}
        {@const axisCoord = isThisDragging ? dragAxis : priorityToAxis(p.priority)}
        {@const crossCoord = getCross(p.id)}
        {@const x = orientation === "horizontal" ? axisCoord : crossCoord}
        {@const y = orientation === "horizontal" ? crossCoord : axisCoord}
        {@const thisPriority = isThisDragging ? dragPriority : p.priority}
        <g>
          <circle
            cx={x}
            cy={y}
            r="5"
            fill="#90caf9"
            opacity={hoveringId === p.id ? "1" : "0.7"}
            stroke={hoveringId === p.id ? "#fff" : "none"}
            stroke-width={hoveringId === p.id ? "1" : "0"}
            style="cursor: pointer;"
            on:pointerdown={(e) => onPointerDown(e, p)}
            on:pointerover={() => onPointHover(p)}
            on:pointerout={onPointLeave}
            on:contextmenu={(e) => onPointContextMenu(e, p)}
            role="button"
            tabindex="0"
          />
          {#if isThisDragging}
            <text
              x={x}
              y={y - 10}
              font-size="11"
              fill="#3f51b5"
              text-anchor="middle"
              font-weight="bold"
              style="user-select:none;"
            >
              {thisPriority.toFixed(2)}
            </text>
          {/if}
        </g>
      {/if}
    {/each}

    <!-- 当前文档点 -->
    {#if currentPoint}
      {@const cx = orientation === "horizontal" ? currentAxis : currentCross}
      {@const cy = orientation === "horizontal" ? currentCross : currentAxis}
      <circle
        cx={cx}
        cy={cy}
        r="8"
        fill="#ff5252"
        stroke="#fff"
        stroke-width="2"
        style="cursor: pointer;"
        role="button"
        tabindex="0"
        on:pointerdown={(e) => onPointerDown(e, currentPoint)}
        on:pointerover={() => onPointHover(currentPoint)}
        on:pointerout={onPointLeave}
        on:contextmenu={(e) => onPointContextMenu(e, currentPoint)}
      />
      <text
        x={cx}
        y={cy - 14}
        font-size="12"
        fill="#ff5252"
        text-anchor="middle"
        font-weight="bold"
        style="user-select:none;"
      >
        {currentPriority.toFixed(2)}
      </text>
    {/if}

    {#if hoveringId && hoverPoint?.title}
      {@const hoverAxis = priorityToAxis(hoverPoint.priority)}
      {@const hoverCross = getCross(hoveringId)}
      {@const hx = orientation === "horizontal" ? hoverAxis : hoverCross}
      {@const hy = orientation === "horizontal" ? hoverCross : hoverAxis}
      <g>
        <rect
          x={orientation === "horizontal" ? Math.min(Math.max(10, hx - 100), axisLength - 200) : hx + 8}
          y={orientation === "horizontal" ? hy - 35 : Math.min(Math.max(10, hy - 12), axisLength - 30)}
          width="200"
          height="25"
          rx="4"
          fill="rgba(0,0,0,0.7)"
        />
        <text
          x={orientation === "horizontal" ? Math.min(Math.max(10, hx - 100), axisLength - 200) + 100 : hx + 108}
          y={orientation === "horizontal" ? hy - 18 : Math.min(Math.max(10, hy - 12), axisLength - 30) + 16}
          font-size="12"
          fill="#ffffff"
          text-anchor="middle"
          style="user-select:none;"
        >
          {hoverPoint.title}
        </text>
      </g>
    {/if}
  </svg>
</div>

<style>
  svg {
    user-select: none;
  }
</style>
