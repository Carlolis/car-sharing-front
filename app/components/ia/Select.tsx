import { FaCircle } from 'react-icons/fa'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ModelSSelectProps {
  setSelectedModel: (value: string) => void
}

export const ModelSelect = ({ setSelectedModel }: ModelSSelectProps) => (
  <div className="rounded-md shadow-sm -space-y-px ">
    <div className="flex space-x-2 ">
      <div className="flex-1 ">
        <Select
          name="model"
          onValueChange={value => setSelectedModel(value)}
        >
          <SelectTrigger
            id="model"
            name="model"
            className=" bg-white"
          >
            <SelectValue placeholder="Choisis un modèle" />
          </SelectTrigger>
          <SelectContent className=" bg-white cursor-pointer">
            <SelectItem
              className="cursor-pointer"
              value="codestral:latest"
            >
              <FaCircle className="inline-block mr-1 text-green-600" />
              🇫🇷 Mistral Codestral Latest
            </SelectItem>
            <SelectItem className="cursor-pointer" value="mistral-small3.2:24b">
              <FaCircle className="inline-block mr-1 text-yellow-600" />
              🇫🇷 Mistral Small 3 24B
            </SelectItem>

            <SelectItem className="cursor-pointer" value="devstral:latest">
              <FaCircle className="inline-block mr-1 text-yellow-600" />
              🇫🇷 Mistral Devstral
            </SelectItem>
            {
              /* <SelectItem className="cursor-pointer" value="deepseek-coder-v2:latest">
              <div>
                <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                <FaCircle className="inline-block mr-1 text-green-600" />
                🇨🇳 DeepSeek Coder V2 Latest
              </div>
            </SelectItem>
            <SelectItem className="cursor-pointer" value="deepseek-r1:32b-qwen-distill-q4_K_M">
              <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
              <FaCircle className="inline-block mr-1 text-red-600" />
              <GiBrain className="inline-block mr-1 text-purple-600" />
              🇨🇳 DeepSeek R1 32B Distill
            </SelectItem>
            <SelectItem className="cursor-pointer" value="deepseek-r1:14b-qwen-distill-q4_K_M">
              <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
              <FaCircle className="inline-block mr-1 text-green-600" />
              <GiBrain className="inline-block mr-1 text-purple-600" />
              🇨🇳 DeepSeek R1 14B Distill
            </SelectItem> */
            }

            <SelectItem className="cursor-pointer" value="qwen2.5-coder:14b">
              <FaCircle className="inline-block mr-1 text-green-600" />
              🇨🇳 Qwen 2.5 Coder 14b
            </SelectItem>
            <SelectItem className="cursor-pointer" value="qwen2.5-coder:7b">
              <FaCircle className="inline-block mr-1 text-blue-600" />
              🇨🇳 Qwen 2.5 Coder 7b
            </SelectItem>
            <SelectItem className="cursor-pointer" value="qwen3-coder:latest">
              <FaCircle className="inline-block mr-1 text-green-600" />
              🇨🇳 Qwen 3 Coder Coder 7b
            </SelectItem>
            {
              /* <SelectItem className="cursor-pointer" value="llama3.1:8b">
              <FaCircle className="inline-block mr-1 text-blue-600" />
              🇺🇸 Llama 3.1 8b
            </SelectItem>
            <SelectItem className="cursor-pointer" value="llama3.2:3b">
              <FaCircle className="inline-block mr-1 text-blue-600" />
              🇺🇸 Llama 3.2 3b
            </SelectItem>
            <SelectItem className="cursor-pointer" value="openthinker:latest">
              <FaCircle className="inline-block mr-1 text-blue-600" />
              <GiBrain className="inline-block mr-1 text-purple-600" />
              🇺🇸🇨🇳 Open Thinker 7b
            </SelectItem> */
            }
            <SelectItem className="cursor-pointer" value="gemma3:12b-it-qat">
              <FaCircle className="inline-block mr-1 text-blue-600" />

              🇺🇸 Gemma 3 12b
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)
