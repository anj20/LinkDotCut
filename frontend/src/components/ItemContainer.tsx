import React from "react";

interface ItemContainerProps {
  imageSrc: string;
  name: string;
  description: string;
}

const ItemContainer: React.FC<ItemContainerProps> = ({
  imageSrc,
  name,
  description,
}) => {
  return (
    <div className="max-w-md mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-72 w-full object-fill md:w-48"
            src={imageSrc}
            alt={name}
          />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {name}
          </div>
          <p className="mt-2 text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemContainer;
