import type React from 'react';
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    onSearch: (term: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
    return (
        <Input
            type="text"
            placeholder="Найти иконку..."
            className="w-full"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        />
    );
};

export default SearchInput;
