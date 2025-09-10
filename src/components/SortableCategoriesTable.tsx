"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface SortableCategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onReorder: (categories: Category[]) => void;
}

interface SortableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function SortableRow({ category, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <button
            {...attributes}
            {...listeners}
            className="mr-2 p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <div className="w-[80px]">{category.id}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {category.image_url ? (
            <div className="relative">
              <Image 
                src={category.image_url} 
                alt="Category"
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('.placeholder-fallback') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="placeholder-fallback hidden w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>{category.name_en}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>{category.name_ro}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{category.slug}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {category.description_en || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {category.description_ro || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function SortableCategoriesTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onReorder 
}: SortableCategoriesTableProps) {
  const [items, setItems] = useState(categories);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update sort_order for all items
      const reorderData = newItems.map((item, index) => ({
        category_id: item.id,
        new_position: index
      }));

      try {
        setIsReordering(true);
        await api.reorderCategories(reorderData);
        onReorder(newItems);
      } catch (error) {
        console.error('Error reordering categories:', error);
        // Revert the local state on error
        setItems(categories);
        alert('Failed to reorder categories. Please try again.');
      } finally {
        setIsReordering(false);
      }
    }
  };

  // Update local state when categories prop changes
  React.useEffect(() => {
    setItems(categories);
  }, [categories]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Categories
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop to reorder categories. {isReordering && (
              <span className="text-blue-600">Saving order...</span>
            )}
          </p>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    English Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Romanian Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    English Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Romanian Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  {items.map((category) => (
                    <SortableRow
                      key={category.id}
                      category={category}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
