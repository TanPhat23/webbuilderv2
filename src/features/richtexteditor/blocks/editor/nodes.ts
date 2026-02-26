import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical";

// Custom nodes
import { ImageNode } from "../../nodes/image-node";
import { AutocompleteNode } from "../../nodes/autocomplete-node";
import { TweetNode } from "../../nodes/embeds/tweet-node";
import { YouTubeNode } from "../../nodes/embeds/youtube-node";

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    AutoLinkNode,
    LinkNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    ImageNode,
    AutocompleteNode,
    TweetNode,
    YouTubeNode,
  ];
