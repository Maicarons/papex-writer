%% papex.cls 鈥?Papex academic paper class (XeLaTeX)
%% arXiv-style typesetting: serif body, black numbered sections,
%% compact title block (authors + superscripts + affiliations),
%% no empty title page.
%%
%% Build: xelatex -> biber -> xelatex -> xelatex
\ProvidesClass{papex}[2026/09/30 v2.0.0 Papex academic paper class (XeLaTeX)]
\NeedsTeXFormat{LaTeX2e}

%% ---------------- options ----------------
\newif\if@papex@twocolumn
\DeclareOption{twocolumn}{\@papex@twocolumntrue}
\newcommand{\papex@fontset}{fandol}
\DeclareOption{fontset}{\renewcommand{\papex@fontset}{#1}}
\newcommand{\papex@bibstyle}{numeric}
\DeclareOption{bibstyle}{\renewcommand{\papex@bibstyle}{#1}}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax

\def\papex@colopt{}
\if@papex@twocolumn\def\papex@colopt{twocolumn}\fi
\LoadClass[a4paper,11pt,\papex@colopt]{article}

%% ---------------- packages ----------------
\RequirePackage[fontset=\papex@fontset,scheme=plain]{ctex}
\RequirePackage{etoolbox}
\RequirePackage{xcolor}
\RequirePackage{geometry}
\RequirePackage{fancyhdr}
\RequirePackage{graphicx}
\RequirePackage{booktabs}
\RequirePackage{amsmath,amssymb,amsthm}
\RequirePackage{enumitem}
\RequirePackage{microtype}
\RequirePackage{titlesec}
\RequirePackage[backend=biber,style=\papex@bibstyle,sorting=none,
                giveninits=true,terseinits=true]{biblatex}
\RequirePackage{hyperref}

%% ---------------- page geometry (arXiv-like) ----------------
\geometry{
  a4paper,
  left=2.5cm,right=2.5cm,
  top=2.2cm,bottom=2.2cm,
  headheight=14pt,
  headsep=12pt,
  footskip=18pt,
}

%% ---------------- colors (minimal) ----------------
\definecolor{papexink}{RGB}{20,20,20}
\definecolor{papexmuted}{RGB}{90,90,90}
\definecolor{papexrule}{RGB}{160,160,160}
\definecolor{papexlink}{RGB}{0,80,160}

%% ---------------- metadata commands ----------------
%% Empty values use \def (not \newcommand) so \ifx...\@empty tests work.
\def\papex@paperid{}
\newcommand{\papexPaperId}[1]{\def\papex@paperid{#1}}
\def\papex@subtitle{}
\newcommand{\papexSubtitle}[1]{\def\papex@subtitle{#1}}
\def\papex@venue{}
\newcommand{\papexVenue}[1]{\def\papex@venue{#1}}
\def\papex@doi{}
\newcommand{\papexDoi}[1]{\def\papex@doi{#1}}
\def\papex@versionnote{}
\newcommand{\papexVersionNote}[1]{\def\papex@versionnote{#1}}
\def\papex@keywords{}
\newcommand{\papexKeywords}[1]{\def\papex@keywords{#1}}
\def\papex@license{CC-BY-4.0}
\newcommand{\papexLicense}[1]{\def\papex@license{#1}}
\def\papex@runningtitle{}
\newcommand{\papexRunningTitle}[1]{\def\papex@runningtitle{#1}}
\def\papex@pdfauthor{}
\newcommand{\papexPdfAuthor}[1]{\def\papex@pdfauthor{#1}}
\def\papex@date{}
%% Optional date override; empty => use \today
\newcommand{\papexDate}[1]{\def\papex@date{#1}}

%% ---------------- authors / affiliations (authblk-compatible API) ----------------
%% Accepts \author[1]{Name} and \affil[1]{Text} as emitted by papex-build.py.
\newif\if@papex@affil@used
\@papex@affil@usedfalse
\newif\if@papex@first@author
\@papex@first@authortrue
\newif\if@papex@first@affil
\@papex@first@affiltrue

\newcommand{\papex@authors}{}
\newcommand{\papex@affils}{}

%% \author[<affil-id>]{<name with optional \thanks>}
\def\author{\@ifnextchar[{\papex@auth@opt}{\papex@auth@opt[]}}
\def\papex@auth@opt[#1]#2{%
  \if@papex@first@author
    \@papex@first@authorfalse
  \else
    \g@addto@macro\papex@authors{, }%
  \fi
  \if\relax\detokenize{#1}\relax
    \g@addto@macro\papex@authors{#2}%
  \else
    \g@addto@macro\papex@authors{#2\textsuperscript{#1}}%
  \fi
}

\newcommand{\papex@affilsep}{\\}
\def\affil{\@ifnextchar[{\papex@affil@opt}{\papex@affil@opt[]}}
\def\papex@affil@opt[#1]#2{%
  \@papex@affil@usedtrue
  \if@papex@first@affil
    \@papex@first@affilfalse
  \else
    \g@addto@macro\papex@affils{\\}%
  \fi
  \if\relax\detokenize{#1}\relax
    \g@addto@macro\papex@affils{#2}%
  \else
    \g@addto@macro\papex@affils{\textsuperscript{#1}#2}%
  \fi
}

%% ---------------- title block (arXiv style) ----------------
\renewcommand{\maketitle}{%
  \par
  \begingroup
  \renewcommand{\thefootnote}{\fnsymbol{footnote}}%
  \setcounter{footnote}{0}%
  % --- paper id ---
  \ifx\papex@paperid\@empty\else
    {\centering\footnotesize\color{papexmuted}\papex@paperid\par}
    \vspace{0.4em}
  \fi
  % --- title ---
  {\centering\LARGE\bfseries\color{papexink}\@title\par}
  \ifx\papex@subtitle\@empty\else
    \vspace{0.3em}
    {\centering\large\color{papexmuted}\papex@subtitle\par}
  \fi
  \vspace{0.75em}
  % --- authors ---
  {\centering\large\papex@authors\par}
  \vspace{0.3em}
  % --- affiliations ---
  \if@papex@affil@used
    {\centering\small\color{papexmuted}%
      \begin{tabular}{@{}c@{}}\papex@affils\end{tabular}\par}
    \vspace{0.2em}
  \fi
  % --- date / venue / doi (compact single block) ---
  {\centering\footnotesize\color{papexmuted}%
    \ifx\papex@date\@empty\else\papex@date\fi
    \ifx\papex@venue\@empty\else
      \ifx\papex@date\@empty\else\ \textbullet\ \fi
      \textit{\papex@venue}%
    \fi
    \ifx\papex@doi\@empty\else
      \ \textbullet\ DOI:\ \href{https://doi.org/\papex@doi}{\papex@doi}%
    \fi
    \par}
  \ifx\papex@versionnote\@empty\else
    {\centering\footnotesize\itshape\color{papexmuted}\papex@versionnote\par}
  \fi
  \vspace{0.55em}
  {\centering\hrule height 0.4pt}
  \vspace{0.7em}
  \endgroup
  \setcounter{footnote}{0}%
}

%% ---------------- abstract (arXiv: indented block, bold heading) ----------------
\renewenvironment{abstract}{%
  \par\smallskip
  \noindent\textbf{Abstract.}\ \ignorespaces
}{%
  \par\medskip
  \ifx\papex@keywords\@empty\else
    \noindent\textbf{Keywords:}\ \papex@keywords\par\medskip
  \fi
}

%% Chinese keyword label when the paper is Chinese 鈥?keep English "Keywords"
%% for international look; generator puts the words themselves.

%% ---------------- sections (black, bold, numbered) ----------------
\titleformat{\section}
  {\large\bfseries\color{papexink}}
  {\thesection}{0.6em}{}
\titlespacing*{\section}{0pt}{1.15em plus 0.25em minus 0.1em}{0.5em plus 0.1em}

\titleformat{\subsection}
  {\normalsize\bfseries\color{papexink}}
  {\thesubsection}{0.55em}{}
\titlespacing*{\subsection}{0pt}{0.95em plus 0.2em minus 0.1em}{0.4em plus 0.08em}

\titleformat{\subsubsection}
  {\normalsize\bfseries\color{papexink}}
  {\thesubsubsection}{0.5em}{}
\titlespacing*{\subsubsection}{0pt}{0.8em plus 0.15em minus 0.08em}{0.35em plus 0.06em}

\titleformat{\paragraph}[runin]
  {\normalsize\bfseries\color{papexink}}
  {\theparagraph}{0.5em}{}[.]
\titlespacing*{\paragraph}{0pt}{0.7em plus 0.1em}{0.6em}

%% ---------------- headers / footers ----------------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.3pt}
\renewcommand{\footrulewidth}{0pt}
\fancyhead[L]{\footnotesize\color{papexmuted}%
  \ifx\papex@runningtitle\@empty
    \ifx\papex@paperid\@empty\else\papex@paperid\fi
  \else\papex@runningtitle\fi}
\fancyhead[R]{\footnotesize\color{papexmuted}%
  \ifx\papex@paperid\@empty\else\papex@paperid\fi}
\fancyfoot[C]{\footnotesize\color{papexmuted}\thepage}

\fancypagestyle{plain}{%
  \fancyhf{}%
  \renewcommand{\headrulewidth}{0pt}%
  \fancyfoot[C]{\footnotesize\color{papexmuted}\thepage}%
}

%% ---------------- fonts: slightly more paper-like Latin ----------------
%% Keep ctex/fandol for CJK; Latin uses the default (LM/Times via fontspec if present).
%% If TeX Gyre Termes is available, prefer it for a Times-like body.
\IfFontExistsTF{TeX Gyre Termes}{%
  \setmainfont{TeX Gyre Termes}[
    BoldFont={TeX Gyre Termes Bold},
    ItalicFont={TeX Gyre Termes Italic},
    BoldItalicFont={TeX Gyre Termes Bold Italic},
  ]%
}{%
  \IfFontExistsTF{Times New Roman}{%
    \setmainfont{Times New Roman}%
  }{}%
}

%% ---------------- lists / captions / float ----------------
\setlist{itemsep=0.15em,topsep=0.3em,leftmargin=1.6em}
\setlist[enumerate]{label=\arabic*.}

\newcommand{\papex@captionfont}{\small}
\let\papex@oldcaption\caption
\renewcommand{\caption}[2][]{\papex@oldcaption[#1]{\papex@captionfont #2}}

%% ---------------- theorem-like (optional) ----------------
\theoremstyle{plain}
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\newtheorem{example}[theorem]{Example}
\theoremstyle{remark}
\newtheorem{remark}[theorem]{Remark}

%% ---------------- acknowledgments helper ----------------
\newcommand{\papexAcknowledgments}[1]{%
  \section*{Acknowledgments}%
  #1%
}
\newcommand{\papexFunding}[1]{%
  \paragraph*{Funding.} #1%
}

%% ---------------- hyperref (last) ----------------
\AtBeginDocument{%
  \hypersetup{
    colorlinks=true,
    linkcolor=papexlink,
    citecolor=papexlink,
    urlcolor=papexlink,
    bookmarksnumbered=true,
    pdftitle={\@title},
    pdfauthor={\papex@pdfauthor},
    pdfkeywords={\papex@keywords},
  }%
}

%% ---------------- citation aliases ----------------
\let\citeauthoryear\parencite
\newcommand{\citep}[1]{\parencite{#1}}
\newcommand{\citet}[1]{\textcite{#1}}

\endinput
