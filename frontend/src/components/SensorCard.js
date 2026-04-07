import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function SensorCard({ sensor, onUpdate }) {
  const [volume, setVolume] = useState(sensor.current_volume);

  const getStatusColor = () => {
    if (!sensor.is_enabled) return 'bg-gray-400';
    if (sensor.status === 'alarm') return 'bg-red-600 animate-pulse';
    if (sensor.status === 'open') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!sensor.is_enabled) return 'Disabled';
    if (sensor.status === 'alarm') return 'ALARM';
    if (sensor.status === 'open') return 'Open';
    return 'Closed';
  };

  const handleToggle = (checked) => {
    onUpdate(sensor.id, { is_enabled: checked });
  };

  const handleVolumeApply = () => {
    onUpdate(sensor.id, { current_volume: volume });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
        sensor.status === 'alarm' ? 'border-red-600' : 'border-blue-600'
      }`}
      data-testid={`sensor-card-${sensor.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900" data-testid={`sensor-name-${sensor.id}`}>{sensor.name}</h3>
          <p className="text-sm text-gray-600" data-testid={`sensor-location-${sensor.id}`}>{sensor.location}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor()}`} data-testid={`sensor-status-${sensor.id}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Status Icon */}
      <div className="flex items-center justify-center my-4">
        {sensor.status === 'alarm' ? (
          <div className="animate-bounce">
            <svg className="w-16 h-16 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        ) : sensor.status === 'open' ? (
          <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4 border-t pt-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Sensor Status</label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{sensor.is_enabled ? 'Enabled' : 'Disabled'}</span>
            <Switch
              checked={sensor.is_enabled}
              onCheckedChange={handleToggle}
              data-testid={`sensor-toggle-${sensor.id}`}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume: <span data-testid={`sensor-volume-value-${sensor.id}`}>{volume}%</span>
          </label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
              data-testid={`sensor-volume-slider-${sensor.id}`}
              disabled={!sensor.is_enabled}
            />
            <button
              onClick={handleVolumeApply}
              disabled={!sensor.is_enabled || volume === sensor.current_volume}
              data-testid={`sensor-volume-apply-${sensor.id}`}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Last Seen */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        Last seen: {new Date(sensor.last_seen).toLocaleString()}
      </div>
    </div>
  );
}