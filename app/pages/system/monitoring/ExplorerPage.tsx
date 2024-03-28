/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import fuzzysort from 'fuzzysort'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { OrthographicCamera } from 'three'

import {
  Add12Icon,
  Close8Icon,
  Filter12Icon,
  Logs16Icon,
  NextArrow12Icon,
  PrevArrow12Icon,
  Search16Icon,
  Warning12Icon,
} from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Tabs } from '~/ui/lib/Tabs'
import { titleCase } from '~/util/str'
import {
  generateMockSensorData,
  generateSensorValuesArray,
  sensors,
  temperatureRanges,
  type SensorValues,
} from 'app/components/monitoring/data'
import { ExplorerTimeline } from 'app/components/monitoring/ExplorerTimeline'
import { Minus12Icon } from 'app/components/monitoring/Icons'
import Scene from 'app/components/monitoring/Scene'
import { useMonitoringStore } from 'app/components/monitoring/Store'

export type CameraSettings = {
  position: [number, number, number]
  target: [number, number, number]
  zoom: number
}

type MonitoringContextType = {
  selectedTime: number | null
  setSelectedTime: (value: number | null) => void
  selectedComponent: string | null
  setSelectedComponent: (value: string | null) => void
  sensorDataArray: SensorValues[]
  sled: number | undefined
  cameraSettings: CameraSettings
  setCameraSettings: (props: CameraSettings) => void
}

export const defaultState: MonitoringContextType = {
  selectedTime: 20,
  setSelectedTime: () => {},
  selectedComponent: null,
  setSelectedComponent: () => {},
  sensorDataArray: [],
  sled: undefined,
  cameraSettings: { position: [0, 0, 0], target: [0, 0, 0], zoom: 10 },
  setCameraSettings: () => {},
}

export const minZoom = 3
export const maxZoom = 48

const MonitoringContext = createContext<MonitoringContextType>(defaultState)

export const useMonitoring = () => useContext(MonitoringContext)

export function ExplorerPage() {
  const [selectedTime, setSelectedTime] = useState<number | null>(20)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(
    defaultState.cameraSettings
  )

  const { sled } = useParams()
  const sledNum = sled ? parseInt(sled, 10) : undefined

  const sensorDataArray = useMemo(() => {
    const mockData = generateMockSensorData()
    return generateSensorValuesArray(mockData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sled])

  const { fitRack } = useMonitoringStore()

  const cameraRef = useRef<OrthographicCamera>(null)

  const navigate = useNavigate()

  const handleBack = () => {
    if (selectedComponent) {
      setSelectedComponent(null)
    }
  }

  const [zoom, setZoom] = useState(3)

  const handleZoomIn = () => {
    if (zoom < maxZoom && cameraRef.current) {
      const roundedZoom = Math.floor(cameraRef.current.zoom / 3) * 3
      cameraRef.current.zoom = roundedZoom + 3
      setZoom(cameraRef.current.zoom)
    }
  }

  const handleZoomOut = () => {
    if (zoom > minZoom && cameraRef.current) {
      const roundedZoom = Math.ceil(cameraRef.current.zoom / 3) * 3
      cameraRef.current.zoom = roundedZoom - 3
      setZoom(cameraRef.current.zoom)
    }
  }

  return (
    <MonitoringContext.Provider
      value={{
        sled: sledNum,
        selectedTime,
        setSelectedTime,
        selectedComponent,
        setSelectedComponent,
        sensorDataArray,
        cameraSettings,
        setCameraSettings,
      }}
    >
      <div className="grid h-full max-h-[calc(100vh-60px)] grid-cols-[1fr,14.25rem]">
        <div className="grid grid-rows-[1fr,12.75rem]">
          <div className="relative max-h-[calc(100vh-60px-204px)] bg-raise">
            <Scene setZoom={setZoom} cameraRef={cameraRef} />
            <div className="absolute left-4 top-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8"
                onClick={() => {
                  if (sled && !selectedComponent) {
                    navigate('/system/monitoring/explorer')
                    fitRack()
                  } else {
                    handleBack()
                  }
                }}
              >
                <PrevArrow12Icon />
              </Button>
              {sled && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedComponent(null)}
                >
                  Sled {sled}
                </Button>
              )}
              {selectedComponent && (
                <Button size="sm" variant="secondary" className="pointer-events-none">
                  {selectedComponent}
                </Button>
              )}
            </div>

            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8"
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
              >
                <Add12Icon />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8"
                onClick={handleZoomOut}
                disabled={zoom <= minZoom}
              >
                <Minus12Icon />
              </Button>
            </div>
          </div>
          <ExplorerTimeline />
        </div>
        <ExplorerSidebar />
      </div>
    </MonitoringContext.Provider>
  )
}

const ExplorerSidebar = () => {
  const [filterInput, setFilterInput] = useState('')
  const { sled, selectedComponent, setSelectedComponent, selectedTime, sensorDataArray } =
    useMonitoring()

  const sensorData = sensorDataArray[selectedTime || 0]

  const allSensors = Object.entries(sensorData).map(([label, value]) => {
    const sensor = sensors.find((s) => s.label === label)
    return {
      label,
      value,
      showWarning: sensor ? value > temperatureRanges[sensor.type][1] : false,
      showUrgent: sensor ? value > temperatureRanges[sensor.type][2] : false,
    }
  })

  const results = fuzzysort.go(filterInput, allSensors, { key: 'label' })

  return (
    <div className="overflow-hidden border-l border-l-secondary">
      <Tabs.Root defaultValue="values" className="pane flex flex-col">
        <Tabs.List className="z-10 pt-2 !bg-default">
          <Tabs.Trigger value="values">Values</Tabs.Trigger>
          <Tabs.Trigger value="options">Options</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="values"
          className="flex max-h-[calc(100vh-108px)] flex-shrink flex-grow flex-col"
        >
          <div className="z-10 border-b p-4 bg-default border-secondary">
            <div className="relative flex items-center gap-2 rounded border p-2 text-sans-md border-default ring-accent-secondary focus-within:ring-2">
              <Search16Icon className="absolute left-2 h-3 w-3 text-quinary" />
              <input
                type="text"
                placeholder="Filter components"
                className="border-none bg-transparent p-0 pl-5 pr-2 !outline-none text-sans-md text-default placeholder:text-quaternary focus:ring-0"
                onChange={(e) => setFilterInput(e.target.value)}
              />
            </div>
          </div>
          <div id="scroll" className="flex-shrink flex-grow overflow-auto">
            {filterInput ? (
              results.length > 0 ? (
                <div className="pl-4 pr-4 pt-4">
                  <div className="mb-2 flex items-center text-sans-md text-default">
                    <Filter12Icon className="mr-2 text-quaternary" /> Results
                  </div>
                  {results.map((result) => (
                    <SensorItem
                      key={result.target}
                      sensor={result.obj}
                      isSelected={selectedComponent === result.obj.label}
                      onClick={() => {
                        setSelectedComponent(result.obj.label)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="pt-2 [&_h3]:text-sans-md">
                  <EmptyMessage
                    title="No matches"
                    icon={<Logs16Icon />}
                    body="Could not find a sensor with that label"
                  />
                </div>
              )
            ) : (
              <Accordion.Root type="multiple" defaultValue={['sensors']}>
                {sled ? (
                  <>
                    <SensorGroup value="sensors" items={allSensors} />
                    <SensorGroup value="fans" items={[]} />
                    <SensorGroup value="regulators" items={[]} />
                  </>
                ) : (
                  <SledGroup
                    value="sleds"
                    items={[...Array(32).keys()].map((index) => ({
                      label: `Sled ${index}`,
                    }))}
                  />
                )}
              </Accordion.Root>
            )}
          </div>
        </Tabs.Content>
        <Tabs.Content value="options">Options</Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

type SensorItemType = {
  label: string
  value?: number
  showWarning?: boolean
  showUrgent?: boolean
}

const SensorGroup = ({ value, items }: { value: string; items: SensorItemType[] }) => {
  const { selectedComponent, setSelectedComponent } = useMonitoring()

  return (
    <Accordion.Item
      value={value}
      className="accordion-item border-b p-4 border-b-secondary"
    >
      <Accordion.Header>
        <Accordion.Trigger className="-m-4 flex items-center p-4 text-sans-md text-default">
          <NextArrow12Icon className="arrow mr-2 transition-transform text-quaternary" />{' '}
          {titleCase(value)}
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="pb-3 pt-2">
        {items.map((sensor) => (
          <SensorItem
            key={sensor.label}
            sensor={sensor}
            isSelected={selectedComponent === sensor.label}
            onClick={() => {
              setSelectedComponent(sensor.label)
            }}
          />
        ))}
      </Accordion.Content>
    </Accordion.Item>
  )
}

const SledGroup = ({ value, items }: { value: string; items: SensorItemType[] }) => {
  const navigate = useNavigate()
  const { fitSled } = useMonitoringStore()

  return (
    <Accordion.Item
      value={value}
      className="accordion-item border-b p-4 border-b-secondary"
    >
      <Accordion.Header>
        <Accordion.Trigger className="-m-4 flex items-center p-4 text-sans-md text-default">
          <NextArrow12Icon className="arrow mr-2 transition-transform text-quaternary" />{' '}
          {titleCase(value)}
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="pb-3 pt-2">
        {items.map((sensor, index) => (
          <SensorItem
            key={sensor.label}
            sensor={sensor}
            isSelected={false}
            onClick={() => {
              navigate(`/system/monitoring/explorer/sleds/${index}`)
              fitSled(index)
            }}
          />
        ))}
      </Accordion.Content>
    </Accordion.Item>
  )
}

const SensorItem = ({
  sensor,
  isSelected,
  onClick,
}: {
  sensor: SensorItemType
  isSelected: boolean
  onClick: () => void
}) => {
  const { setSelectedComponent } = useMonitoring()

  const el = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isSelected && el.current) {
      el.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [isSelected])

  return (
    <button
      ref={el}
      key={sensor.label}
      className={cn(
        'relative flex w-full cursor-pointer items-center justify-between rounded py-0.5 pl-5 pr-2 text-sans-md text-secondary',
        'hover:bg-hover',
        isSelected &&
          'text-accent bg-accent-secondary hover:bg-accent-secondary-hover [&_span]:text-accent-secondary'
      )}
      onClick={onClick}
    >
      {isSelected && (
        <Close8Icon
          className="absolute left-1 -m-1 h-4 w-4 p-1"
          onClick={(e) => {
            setSelectedComponent(null)
            e.stopPropagation()
          }}
        />
      )}
      <div>{sensor.label}</div>{' '}
      <div>
        {sensor.showWarning && (
          <Warning12Icon
            className={`mr-1 ${sensor.showUrgent ? 'text-destructive' : 'text-notice'}`}
          />
        )}
        {sensor.value && (
          <span className="text-mono-sm text-tertiary">{sensor.value.toFixed(2)}</span>
        )}
      </div>
    </button>
  )
}
