'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Modal, ModalFooter, LoadingSpinner } from '../ui';
import { equipmentService, LabEquipment, DataImportJob, RealTimeMonitor, EquipmentData } from '../../services/equipmentService';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Wifi, 
  WifiOff, 
  Settings, 
  Play, 
  Pause, 
  Square as Stop,
  Upload,
  Download,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Monitor,
  Database,
  Wrench,
  Zap,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface EquipmentIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId?: string;
  entryId?: string;
}

export const EquipmentIntegration: React.FC<EquipmentIntegrationProps> = ({
  isOpen,
  onClose,
  experimentId,
  entryId
}) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'import' | 'monitor' | 'data'>('equipment');
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [importJobs, setImportJobs] = useState<DataImportJob[]>([]);
  const [monitors, setMonitors] = useState<RealTimeMonitor[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipment | null>(null);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showMonitorForm, setShowMonitorForm] = useState(false);

  // Forms
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    equipment_type: 'other' as LabEquipment['equipment_type'],
    location: '',
    connection_type: 'usb' as LabEquipment['connection_type'],
    api_endpoint: '',
    capabilities: [] as string[],
    data_formats: [] as string[]
  });

  const [importForm, setImportForm] = useState({
    equipment_id: '',
    job_type: 'batch_import' as DataImportJob['job_type'],
    file: null as File | null,
    data_format: 'csv',
    column_mapping: {} as Record<string, string>
  });

  const [monitorForm, setMonitorForm] = useState({
    equipment_id: '',
    parameters: [] as string[],
    sampling_interval: 60,
    alert_conditions: [] as RealTimeMonitor['alert_conditions']
  });

  // Filters
  const [equipmentFilter, setEquipmentFilter] = useState({
    type: 'all',
    status: 'all',
    location: ''
  });

  const [capabilityInput, setCapabilityInput] = useState('');
  const [formatInput, setFormatInput] = useState('');
  const [parameterInput, setParameterInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEquipment();
      loadImportJobs();
      loadMonitors();
    }
  }, [isOpen]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (equipmentFilter.type !== 'all') params.equipment_type = equipmentFilter.type;
      if (equipmentFilter.status !== 'all') params.status = equipmentFilter.status;
      if (equipmentFilter.location) params.location = equipmentFilter.location;
      
      const data = await equipmentService.getEquipment(params);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImportJobs = async () => {
    try {
      const jobs = await equipmentService.getDataImportJobs();
      setImportJobs(jobs);
    } catch (error) {
      console.error('Failed to load import jobs:', error);
    }
  };

  const loadMonitors = async () => {
    try {
      const monitorList = await equipmentService.getRealTimeMonitors();
      setMonitors(monitorList);
    } catch (error) {
      console.error('Failed to load monitors:', error);
    }
  };

  const loadEquipmentData = async (equipmentId: string) => {
    try {
      const response = await equipmentService.getEquipmentData({
        equipment_id: equipmentId,
        size: 100
      });
      setEquipmentData(response.data);
    } catch (error) {
      console.error('Failed to load equipment data:', error);
    }
  };

  const handleAddEquipment = async () => {
    if (!equipmentForm.name || !equipmentForm.manufacturer) return;

    setLoading(true);
    try {
      await equipmentService.registerEquipment({
        ...equipmentForm,
        status: 'available'
      });
      setShowAddEquipment(false);
      setEquipmentForm({
        name: '',
        model: '',
        manufacturer: '',
        serial_number: '',
        equipment_type: 'other',
        location: '',
        connection_type: 'usb',
        api_endpoint: '',
        capabilities: [],
        data_formats: []
      });
      await loadEquipment();
    } catch (error) {
      console.error('Failed to add equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (equipmentId: string) => {
    try {
      const result = await equipmentService.testConnection(equipmentId);
      alert(result.success ? 'Connection successful!' : `Connection failed: ${result.message}`);
    } catch (error: any) {
      alert(`Connection test failed: ${error.message}`);
    }
  };

  const handleStartImport = async () => {
    if (!importForm.equipment_id || !importForm.file) return;

    setLoading(true);
    try {
      await equipmentService.importDataFromFile(
        importForm.equipment_id,
        importForm.file,
        {
          experiment_id: experimentId,
          entry_id: entryId,
          column_mapping: importForm.column_mapping,
          data_format: importForm.data_format
        }
      );
      setShowImportForm(false);
      await loadImportJobs();
    } catch (error) {
      console.error('Failed to start import:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    if (!monitorForm.equipment_id || monitorForm.parameters.length === 0) return;

    setLoading(true);
    try {
      await equipmentService.startRealTimeMonitoring({
        ...monitorForm,
        experiment_id: experimentId
      });
      setShowMonitorForm(false);
      await loadMonitors();
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async (monitorId: string) => {
    try {
      await equipmentService.stopRealTimeMonitoring(monitorId);
      await loadMonitors();
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const addCapability = () => {
    if (capabilityInput.trim()) {
      setEquipmentForm(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capabilityInput.trim()]
      }));
      setCapabilityInput('');
    }
  };

  const addFormat = () => {
    if (formatInput.trim()) {
      setEquipmentForm(prev => ({
        ...prev,
        data_formats: [...prev.data_formats, formatInput.trim()]
      }));
      setFormatInput('');
    }
  };

  const addParameter = () => {
    if (parameterInput.trim()) {
      setMonitorForm(prev => ({
        ...prev,
        parameters: [...prev.parameters, parameterInput.trim()]
      }));
      setParameterInput('');
    }
  };

  const removeItem = (list: string[], index: number, setter: (fn: (prev: any) => any) => void, key: string) => {
    setter((prev: any) => ({
      ...prev,
      [key]: list.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'in_use': return 'text-blue-600 bg-blue-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'in_use': return <Activity className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Laboratory Equipment Integration" size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'equipment', label: 'Equipment', icon: Monitor },
              { key: 'import', label: 'Data Import', icon: Upload },
              { key: 'monitor', label: 'Real-time Monitor', icon: Activity },
              { key: 'data', label: 'Equipment Data', icon: Database },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Lab Equipment</h3>
                <p className="text-sm text-gray-600">Manage and configure laboratory instruments</p>
              </div>
              <Button onClick={() => setShowAddEquipment(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={equipmentFilter.type}
                onChange={(e) => setEquipmentFilter(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="spectrometer">Spectrometer</option>
                <option value="chromatograph">Chromatograph</option>
                <option value="microscope">Microscope</option>
                <option value="centrifuge">Centrifuge</option>
                <option value="thermocycler">Thermocycler</option>
                <option value="balance">Balance</option>
                <option value="ph_meter">pH Meter</option>
                <option value="incubator">Incubator</option>
                <option value="other">Other</option>
              </select>

              <select
                value={equipmentFilter.status}
                onChange={(e) => setEquipmentFilter(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </select>

              <Input
                placeholder="Location..."
                value={equipmentFilter.location}
                onChange={(e) => setEquipmentFilter(prev => ({ ...prev, location: e.target.value }))}
              />

              <Button variant="outline" onClick={loadEquipment}>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            {/* Equipment List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.manufacturer} {item.model}</p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900 capitalize">{item.equipment_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-900">{item.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Connection:</span>
                        <span className="text-gray-900 uppercase">{item.connection_type}</span>
                      </div>
                    </div>

                    {/* Capabilities */}
                    {item.capabilities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.capabilities.slice(0, 3).map((cap, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {item.capabilities.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{item.capabilities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button 
                         
                        variant="outline" 
                        onClick={() => handleTestConnection(item.id)}
                        disabled={item.status === 'offline'}
                      >
                        <Wifi className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button 
                         
                        variant="outline" 
                        onClick={() => {
                          setSelectedEquipment(item);
                          loadEquipmentData(item.id);
                        }}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Data
                      </Button>
                      <Button  variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {equipment.length === 0 && !loading && (
                  <div className="col-span-full text-center py-8">
                    <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment registered</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first laboratory instrument</p>
                    <Button onClick={() => setShowAddEquipment(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Equipment
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Data Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Data Import</h3>
                <p className="text-sm text-gray-600">Import data from laboratory instruments</p>
              </div>
              <Button onClick={() => setShowImportForm(true)}>
                <Upload className="w-4 h-4 mr-2" />
                New Import
              </Button>
            </div>

            {/* Import Jobs */}
            <div className="space-y-4">
              {importJobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {equipment.find(e => e.id === job.equipment_id)?.name || 'Unknown Equipment'}
                        </h4>
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Badge variant="default">{job.job_type}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${job.total_records > 0 ? (job.imported_records / job.total_records) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {job.imported_records} / {job.total_records} records
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <p className="text-gray-900">
                            {job.started_at ? format(new Date(job.started_at), 'MMM d, HH:mm') : 'Not started'}
                          </p>
                        </div>
                      </div>

                      {job.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-md">
                          <p className="text-sm font-medium text-red-800">Errors:</p>
                          <ul className="text-sm text-red-700 list-disc list-inside">
                            {job.errors.slice(0, 3).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {job.errors.length > 3 && (
                              <li>... and {job.errors.length - 3} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {job.status === 'running' && (
                        <Button  variant="outline">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      <Button  variant="outline">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {importJobs.length === 0 && (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No import jobs</h3>
                  <p className="text-gray-600 mb-4">Start importing data from your laboratory instruments</p>
                  <Button onClick={() => setShowImportForm(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Import
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-time Monitor Tab */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Real-time Monitoring</h3>
                <p className="text-sm text-gray-600">Monitor equipment parameters in real-time</p>
              </div>
              <Button onClick={() => setShowMonitorForm(true)}>
                <Activity className="w-4 h-4 mr-2" />
                New Monitor
              </Button>
            </div>

            {/* Monitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monitors.map((monitor) => (
                <Card key={monitor.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {equipment.find(e => e.id === monitor.equipment_id)?.name || 'Unknown Equipment'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {monitor.parameters.length} parameter{monitor.parameters.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge className={monitor.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                      {monitor.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sampling:</span>
                      <span className="text-gray-900">Every {monitor.sampling_interval}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Alerts:</span>
                      <span className="text-gray-900">{monitor.alert_conditions.length} conditions</span>
                    </div>
                    {monitor.last_reading && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last reading:</span>
                        <span className="text-gray-900">
                          {format(new Date(monitor.last_reading), 'HH:mm:ss')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {monitor.status === 'active' ? (
                      <Button 
                         
                        variant="outline" 
                        onClick={() => handleStopMonitoring(monitor.id)}
                      >
                        <Stop className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button  variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button  variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}

              {monitors.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active monitors</h3>
                  <p className="text-gray-600 mb-4">Set up real-time monitoring for your equipment</p>
                  <Button onClick={() => setShowMonitorForm(true)}>
                    <Activity className="w-4 h-4 mr-2" />
                    Create Monitor
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Equipment Modal */}
        {showAddEquipment && (
          <Modal 
            isOpen={showAddEquipment} 
            onClose={() => setShowAddEquipment(false)} 
            title="Add Laboratory Equipment"
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Equipment Name"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., HPLC System 1"
                  required
                />

                <Input
                  label="Manufacturer"
                  value={equipmentForm.manufacturer}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., Agilent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model"
                  value={equipmentForm.model}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., 1260 Infinity"
                />

                <Input
                  label="Serial Number"
                  value={equipmentForm.serial_number}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, serial_number: e.target.value }))}
                  placeholder="e.g., SN123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Type
                  </label>
                  <select
                    value={equipmentForm.equipment_type}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, equipment_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="spectrometer">Spectrometer</option>
                    <option value="chromatograph">Chromatograph</option>
                    <option value="microscope">Microscope</option>
                    <option value="centrifuge">Centrifuge</option>
                    <option value="thermocycler">Thermocycler</option>
                    <option value="balance">Balance</option>
                    <option value="ph_meter">pH Meter</option>
                    <option value="incubator">Incubator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Type
                  </label>
                  <select
                    value={equipmentForm.connection_type}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, connection_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="usb">USB</option>
                    <option value="ethernet">Ethernet</option>
                    <option value="serial">Serial</option>
                    <option value="wifi">WiFi</option>
                    <option value="bluetooth">Bluetooth</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Lab Room 101"
                />

                <Input
                  label="API Endpoint (Optional)"
                  value={equipmentForm.api_endpoint}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, api_endpoint: e.target.value }))}
                  placeholder="API endpoint URL (optional)"
                />
              </div>

              {/* Capabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capabilities
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={capabilityInput}
                    onChange={(e) => setCapabilityInput(e.target.value)}
                    placeholder="Add capability..."
                    onKeyPress={(e) => e.key === 'Enter' && addCapability()}
                  />
                  <Button  onClick={addCapability}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {equipmentForm.capabilities.map((cap, index) => (
                    <Badge 
                      key={index} 
                      variant="default"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeItem(equipmentForm.capabilities, index, setEquipmentForm, 'capabilities')}
                    >
                      {cap} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Data Formats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Data Formats
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={formatInput}
                    onChange={(e) => setFormatInput(e.target.value)}
                    placeholder="Add format..."
                    onKeyPress={(e) => e.key === 'Enter' && addFormat()}
                  />
                  <Button  onClick={addFormat}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {equipmentForm.data_formats.map((format, index) => (
                    <Badge 
                      key={index} 
                      variant="success"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeItem(equipmentForm.data_formats, index, setEquipmentForm, 'data_formats')}
                    >
                      {format} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setShowAddEquipment(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEquipment} loading={loading}>
                Add Equipment
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* Equipment Data Modal */}
        {selectedEquipment && (
          <Modal
            isOpen={!!selectedEquipment}
            onClose={() => setSelectedEquipment(null)}
            title={`Data: ${selectedEquipment.name}`}
            size="xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Recent data from {selectedEquipment.name}
                </p>
                <Button  onClick={() => loadEquipmentData(selectedEquipment.id)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {equipmentData.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {equipmentData.map((data) => (
                    <Card key={data.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(data.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Quality Score: {Math.round(data.quality_score * 100)}%
                          </p>
                        </div>
                        <Badge variant="default">
                          {Object.keys(data.parameters).length} parameters
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(data.parameters).slice(0, 4).map(([param, info]) => (
                          <div key={param} className="text-sm">
                            <span className="text-gray-600">{param}:</span>
                            <span className="text-gray-900 ml-1">
                              {info.value} {info.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No data available for this equipment</p>
                </div>
              )}
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};