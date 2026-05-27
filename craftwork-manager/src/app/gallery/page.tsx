'use client';

import { useState, useEffect } from 'react';
import { CraftWork, WorkImage, GalleryAlbum } from '@/types';
import { getCraftWorks, getWorkImagesByCraftWorkId, addWorkImage, deleteWorkImage, setCoverImage, getGalleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum } from '@/lib/storage';
import { formatDate } from '@/lib/calculator';

export default function GalleryPage() {
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedWork, setSelectedWork] = useState<CraftWork | null>(null);
  const [workImages, setWorkImages] = useState<WorkImage[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [selectedAlbumWorks, setSelectedAlbumWorks] = useState<string[]>([]);

  useEffect(() => {
    setWorks(getCraftWorks());
    setAlbums(getGalleryAlbums());
  }, []);

  useEffect(() => {
    if (selectedWork) {
      setWorkImages(getWorkImagesByCraftWorkId(selectedWork.id));
    }
  }, [selectedWork]);

  const handleSelectWork = (work: CraftWork) => {
    setSelectedWork(work);
    setShowImageUpload(false);
  };

  const handleAddImage = () => {
    if (!selectedWork || !imageUrl) return;
    addWorkImage({
      craftWorkId: selectedWork.id,
      url: imageUrl,
      caption: imageCaption,
      isCover: workImages.length === 0,
    });
    setWorkImages(getWorkImagesByCraftWorkId(selectedWork.id));
    setImageUrl('');
    setImageCaption('');
    setShowImageUpload(false);
  };

  const handleDeleteImage = (id: string) => {
    if (confirm('确定要删除这张图片吗？')) {
      deleteWorkImage(id);
      if (selectedWork) {
        setWorkImages(getWorkImagesByCraftWorkId(selectedWork.id));
      }
    }
  };

  const handleSetCover = (id: string) => {
    if (selectedWork) {
      setCoverImage(selectedWork.id, id);
      setWorkImages(getWorkImagesByCraftWorkId(selectedWork.id));
    }
  };

  const handleCreateAlbum = () => {
    if (!albumName) return;
    if (editingAlbum) {
      updateGalleryAlbum(editingAlbum.id, {
        name: albumName,
        description: albumDescription,
        craftWorkIds: selectedAlbumWorks,
      });
    } else {
      addGalleryAlbum({
        name: albumName,
        description: albumDescription,
        craftWorkIds: selectedAlbumWorks,
      });
    }
    setAlbums(getGalleryAlbums());
    setShowAlbumForm(false);
    setEditingAlbum(null);
    setAlbumName('');
    setAlbumDescription('');
    setSelectedAlbumWorks([]);
  };

  const handleEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumName(album.name);
    setAlbumDescription(album.description || '');
    setSelectedAlbumWorks(album.craftWorkIds);
    setShowAlbumForm(true);
  };

  const handleDeleteAlbum = (id: string) => {
    if (confirm('确定要删除这个相册吗？')) {
      deleteGalleryAlbum(id);
      setAlbums(getGalleryAlbums());
    }
  };

  const getCoverImageForWork = (workId: string): string | undefined => {
    const images = getWorkImagesByCraftWorkId(workId);
    const cover = images.find(img => img.isCover);
    return cover?.url || images[0]?.url;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">作品相册档案</h2>
          <p className="text-gray-600 mt-1">管理作品图片，创建精美相册</p>
        </div>
        <button
          onClick={() => setShowAlbumForm(true)}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>📁</span>
          <span>创建相册</span>
        </button>
      </div>

      {showAlbumForm && (
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingAlbum ? '编辑相册' : '创建新相册'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">相册名称</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="请输入相册名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">相册描述</label>
              <textarea
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={3}
                placeholder="请输入相册描述"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择作品</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                {works.map((work) => (
                  <label
                    key={work.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAlbumWorks.includes(work.id)
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAlbumWorks.includes(work.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAlbumWorks([...selectedAlbumWorks, work.id]);
                        } else {
                          setSelectedAlbumWorks(selectedAlbumWorks.filter(id => id !== work.id));
                        }
                      }}
                      className="absolute top-2 right-2 w-4 h-4"
                    />
                    <div className="aspect-square bg-gray-100">
                      {getCoverImageForWork(work.id) ? (
                        <img
                          src={getCoverImageForWork(work.id)!}
                          alt={work.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                          🎨
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center text-xs bg-white">
                      {work.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateAlbum}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {editingAlbum ? '保存修改' : '创建相册'}
              </button>
              <button
                onClick={() => {
                  setShowAlbumForm(false);
                  setEditingAlbum(null);
                  setAlbumName('');
                  setAlbumDescription('');
                  setSelectedAlbumWorks([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {albums.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📁 我的相册</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => {
              const albumWorks = works.filter(w => album.craftWorkIds.includes(w.id));
              const coverImage = album.craftWorkIds.length > 0
                ? getCoverImageForWork(album.craftWorkIds[0])
                : undefined;
              return (
                <div key={album.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    {coverImage ? (
                      <img src={coverImage} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                        📁
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded text-sm">
                      {albumWorks.length} 件作品
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 mb-1">{album.name}</h4>
                    {album.description && (
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{album.description}</p>
                    )}
                    <p className="text-gray-400 text-xs">创建于 {formatDate(album.createdAt)}</p>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleEditAlbum(album)}
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 作品列表</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {works.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-gray-500">暂无作品</p>
              </div>
            ) : (
              works.map((work) => {
                const images = getWorkImagesByCraftWorkId(work.id);
                return (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedWork?.id === work.id
                        ? 'bg-amber-100 border-2 border-amber-500'
                        : 'bg-white hover:bg-amber-50 border-2 border-transparent shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {images.find(img => img.isCover)?.url || images[0]?.url ? (
                          <img
                            src={images.find(img => img.isCover)?.url || images[0]?.url!}
                            alt={work.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🎨
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{work.name}</p>
                        <p className="text-sm text-gray-500">{work.category} · {images.length} 张图片</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedWork ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedWork.name} 的相册
                </h3>
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                >
                  ➕ 添加图片
                </button>
              </div>

              {showImageUpload && (
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="请输入图片链接地址"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">图片说明</label>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="可选：为图片添加说明"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => setShowImageUpload(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {workImages.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h4 className="text-lg font-medium text-gray-600 mb-2">暂无图片</h4>
                  <p className="text-gray-400 mb-4">点击上方按钮为这件作品添加图片</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workImages.map((image) => (
                    <div key={image.id} className="relative group bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-square">
                        <img
                          src={image.url}
                          alt={image.caption || selectedWork.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {image.isCover && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                          封面
                        </div>
                      )}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-2">
                          <p className="text-xs truncate">{image.caption}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        {!image.isCover && (
                          <button
                            onClick={() => handleSetCover(image.id)}
                            className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                          >
                            设为封面
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4">👈</div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">请选择一件作品</h4>
              <p className="text-gray-400">从左侧列表中选择作品来管理其相册</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
