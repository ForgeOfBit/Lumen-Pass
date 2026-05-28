import { useState } from 'react';
import { useVault } from './hooks/useVault';
import { LockScreen } from './components/LockScreen';
import { Sidebar } from './components/Sidebar';
import { VaultList } from './components/VaultList';
import { DetailPane } from './components/DetailPane';
import { AddItemModal } from './components/AddItemModal';
import type { VaultItem, ItemType } from './hooks/useVault';

export default function App() {
  const vault = useVault();

  const [activeCategory, setActiveCategory] = useState<ItemType | 'all'>('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedItem, setSelectedItem]     = useState<VaultItem | null>(null);

  // Modal state
  const [modalOpen, setModalOpen]         = useState(false);
  const [editTarget, setEditTarget]       = useState<VaultItem | null>(null);
  const [defaultType, setDefaultType]     = useState<ItemType>('login');

  /* ── Handlers ── */

  const openAddModal = (type: ItemType = 'login') => {
    setEditTarget(null);
    setDefaultType(type);
    setModalOpen(true);
  };

  const openEditModal = (item: VaultItem) => {
    setEditTarget(item);
    setDefaultType(item.type);
    setModalOpen(true);
  };

  const handleSave = async (item: VaultItem) => {
    if (editTarget) {
      await vault.updateItem(item);
      setSelectedItem(item);           // keep detail pane in sync
    } else {
      await vault.addItem(item);
      setSelectedItem(item);           // auto-select newly added item
    }
  };

  const handleDelete = (id: string) => {
    vault.deleteItem(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  /* ── Lock screen ── */
  if (vault.isLocked) return <LockScreen vault={vault} />;

  return (
    <div className="app-container">
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onLock={vault.lockVault}
        items={vault.vaultItems}
      />

      <VaultList
        items={vault.vaultItems}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        onAddItem={() => openAddModal(
          activeCategory === 'all' ? 'login' : activeCategory
        )}
        onGeneratePassword={() => openAddModal('login')}
      />

      <DetailPane
        item={selectedItem}
        allItems={vault.vaultItems}
        onDelete={handleDelete}
        onEdit={openEditModal}
      />

      <AddItemModal
        open={modalOpen}
        editItem={editTarget}
        defaultType={defaultType}
        loginItems={vault.vaultItems.filter(i => i.type === 'login')}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <div id="toast-container" className="toast-container" />
    </div>
  );
}
