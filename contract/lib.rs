#![cfg_attr(not(feature = "std"), no_std, no_main)]
use ink_lang as ink;
#[ink::contract]
mod link {
    use ink_prelude::vec::Vec;
    use ink_storage::{traits::SpreadAllocate, Mapping};
    const MIN_SLUG_LENGTH: usize = 5;
    type Result<T> = core::result::Result<T, Error>;
    type Url = Vec<u8>;
    type Slug = Vec<u8>;
    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct Link {
        urls: Mapping<Slug, Url>,
        slugs: Mapping<Url, Slug>,
        upgrader: Option<AccountId>,
    }
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum Error {
        SlugUnavailable,
        SlugTooShort,
        UrlNotFound,
        UpgradeDenied,
        UpgradeFailed,
    }
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum SlugCreationMode {
        New(Slug),
        DeduplicateOrNew(Slug),
        Deduplicate,
    }
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum ShorteningOutcome {
        Shortened,
        Deduplicated { slug: Slug },
    }
    #[ink(event)]
    pub struct Shortened {
        slug: Slug,
        url: Url,
    }
    #[ink(event)]
    pub struct Deduplicated {
        slug: Slug,
        url: Url,
    }
    impl Link {
        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.upgrader = Some(contract.env().caller());
            })
        }
        #[ink(constructor)]
        pub fn unstoppable() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.upgrader = None;
            })
        }
        #[ink(message)]
        pub fn shorten(&mut self, slug: SlugCreationMode, url: Url) -> Result<ShorteningOutcome> {
            let slug = match (slug, self.slugs.get(&url)) {
                (
                    SlugCreationMode::Deduplicate | SlugCreationMode::DeduplicateOrNew(_),
                    Some(slug),
                ) => {
                    self.env().emit_event(Deduplicated {
                        slug: slug.clone(),
                        url,
                    });
                    return Ok(ShorteningOutcome::Deduplicated { slug });
                }
                (SlugCreationMode::Deduplicate, None) => return Err(Error::UrlNotFound),
                (SlugCreationMode::New(slug) | SlugCreationMode::DeduplicateOrNew(slug), _) => slug,
            };
            if slug.len() < MIN_SLUG_LENGTH {
                return Err(Error::SlugTooShort);
            }
            if self.urls.insert_return_size(&slug, &url).is_some() {
                return Err(Error::SlugUnavailable);
            }
            self.slugs.insert(&url, &slug);
            self.env().emit_event(Shortened { slug, url });
            Ok(ShorteningOutcome::Shortened)
        }
        #[ink(message)]
        pub fn resolve(&self, slug: Slug) -> Option<Url> {
            self.urls.get(slug)
        }
        #[ink(message)]
        pub fn upgrade(&mut self, code_hash: [u8; 32]) -> Result<()> {
            if self
                .upgrader
                .map(|id| id != self.env().caller())
                .unwrap_or(true)
            {
                return Err(Error::UpgradeDenied);
            }
            ink_env::set_code_hash(&code_hash).map_err(|_| Error::UpgradeFailed)
        }
    }
}
