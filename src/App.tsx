import { useState } from 'react';
import { useVault } from './hooks/useVault';
import { LockScreen } from './components/LockScreen';
import { Sidebar } from './components/Sidebar';
import { VaultList } from './components/VaultList';
import { DetailPane } from './components/DetailPane';
import { AddItemModal } from './components/AddItemModal';
import { ContextMenu } from './components/ContextMenu';
import { ConfirmModal } from './components/ConfirmModal';
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

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: VaultItem | null } | null>(null);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);

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

  const confirmDelete = (item: VaultItem) => {
    setConfirmState({
      open: true,
      title: 'Öğeyi Sil',
      message: `"${item.title}" adlı öğeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      onConfirm: () => {
        vault.deleteItem(item.id);
        if (selectedItem?.id === item.id) setSelectedItem(null);
        setConfirmState(null);
      }
    });
  };

  const handleItemContextMenu = (e: React.MouseEvent, item: VaultItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item: null });
  };

  /* ── Lock screen ── */
  if (vault.isLocked) return <LockScreen vault={vault} />;

  return (
    <div className="app-container" onContextMenu={handleGlobalContextMenu}>
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
        onItemContextMenu={handleItemContextMenu}
      />

      <DetailPane
        item={selectedItem}
        allItems={vault.vaultItems}
        onDeleteRequest={confirmDelete}
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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onEdit={openEditModal}
          onDeleteRequest={confirmDelete}
          onAddLogin={() => openAddModal('login')}
          onAddNote={() => openAddModal('note')}
          onAddCard={() => openAddModal('card')}
          onLockVault={vault.lockVault}
        />
      )}

      {confirmState && (
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      <div id="toast-container" className="toast-container" />
    </div>
  );
}
